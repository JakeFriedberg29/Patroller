import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnterpriseData {
  id: string;
  name: string;
  description?: string;
  totalOrganizations: number;
  totalUsers: number;
  activeIncidents: number;
  resolvedToday: number;
  complianceScore: number;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  organization_type: string;
  users: number;
  status: string;
  lastActivity: string;
  location?: any;
}

export const useEnterpriseData = (tenantId?: string) => {
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEnterpriseData = async () => {
    if (!tenantId || tenantId === "undefined") return;
    
    try {
      setLoading(true);

      // Fetch tenant/enterprise info
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (!tenant) {
        throw new Error('Enterprise not found');
      }

      // Fetch organizations in this tenant
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Get user counts for each organization
      const organizationSummaries: OrganizationSummary[] = [];
      let totalUsers = 0;
      
      for (const org of orgsData || []) {
        const { count: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('organization_id', org.id)
          .eq('status', 'active');

        // Get recent audit log to determine last activity (simplified approach)
        const { data: recentActivity } = await supabase
          .from('audit_logs')
          .select('created_at')
          .eq('resource_type', 'organization')
          .eq('resource_id', org.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastActivity = recentActivity?.[0]?.created_at 
          ? getRelativeTime(new Date(recentActivity[0].created_at))
          : 'No recent activity';

        organizationSummaries.push({
          id: org.id,
          name: org.name,
          organization_type: org.organization_type,
          users: userCount || 0,
          status: 'Active', // Could be enhanced with real status logic
          lastActivity,
          location: org.address,
        });

        totalUsers += userCount || 0;
      }

      // Fetch active incidents across all organizations
      const { count: activeIncidents } = await supabase
        .from('incidents')
        .select('id', { count: 'exact' })
        .in('organization_id', (orgsData || []).map(org => org.id))
        .eq('status', 'open');

      // Fetch resolved incidents today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: resolvedToday } = await supabase
        .from('incidents')
        .select('id', { count: 'exact' })
        .in('organization_id', (orgsData || []).map(org => org.id))
        .eq('status', 'resolved')
        .gte('resolved_at', today.toISOString());

      setEnterpriseData({
        id: tenant.id,
        name: tenant.name,
        description: (tenant.settings as any)?.description || 'Enterprise organization',
        totalOrganizations: orgsData?.length || 0,
        totalUsers,
        activeIncidents: activeIncidents || 0,
        resolvedToday: resolvedToday || 0,
        complianceScore: 94, // Placeholder - could be calculated based on actual metrics
      });

      setOrganizations(organizationSummaries);

    } catch (error) {
      console.error('Error fetching enterprise data:', error);
      toast({
        title: "Error",
        description: "Failed to load enterprise data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours >= 1) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, [tenantId]);

  return { 
    enterpriseData, 
    organizations, 
    loading, 
    refetch: fetchEnterpriseData 
  };
};