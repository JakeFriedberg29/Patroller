import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnterpriseAnalyticsData {
  id: string;
  name: string;
  description?: string;
  totalOrganizations: number;
  totalEnterpriseAdminsAndUsers: number;
  totalOrganizationPatrollers: number;
  reportsSubmittedToday: number;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  organization_type: string;
  users: number;
  status: string;
  lastActivity: string;
  location?: any;
  email?: string;
  phone?: string;
  created?: string;
}

export interface ReportsByOrganizationDatum {
  orgId: string;
  orgName: string;
  count: number;
}

export const useEnterpriseAnalytics = (tenantId?: string) => {
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseAnalyticsData | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [reportsByOrganization, setReportsByOrganization] = useState<ReportsByOrganizationDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    if (!tenantId || tenantId === "undefined") return;
    
    try {
      setLoading(true);

      // Fetch tenant/enterprise info
      const { data: tenant } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (!tenant) {
        throw new Error('Enterprise not found');
      }

      // Fetch organizations in this tenant
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('id, name, organization_type, address, contact_email, contact_phone, is_active, created_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      const orgIds = (orgsData || []).map(o => o.id);

      // Preload all users in this tenant (active)
      const { data: tenantUsers } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      const userIds = (tenantUsers || []).map(u => u.id);

      // Count enterprise admins + enterprise users across tenant
      let totalEnterpriseAdminsAndUsers = 0;
      let totalOrganizationPatrollers = 0;

      if (userIds.length > 0) {
        const { data: roleRows } = await supabase
          .from('user_roles')
          .select('user_id, role_type, is_active')
          .in('user_id', userIds)
          .eq('is_active', true);

        const entSet = new Set<string>();
        const respSet = new Set<string>();
        (roleRows || []).forEach((r: any) => {
          if (r.role_type === 'enterprise_admin' || r.role_type === 'enterprise_user') entSet.add(r.user_id);
          if (r.role_type === 'patroller') respSet.add(r.user_id);
        });
        totalEnterpriseAdminsAndUsers = entSet.size;
        totalOrganizationPatrollers = respSet.size;
      }

      // Organization summaries with user counts per org
      const organizationSummaries: OrganizationSummary[] = [];
      for (const org of orgsData || []) {
        const { count: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('organization_id', org.id)
          .eq('status', 'active');

        organizationSummaries.push({
          id: org.id,
          name: org.name,
          organization_type: org.organization_type,
          users: userCount || 0,
          status: 'Active',
          lastActivity: '—',
          location: org.address,
          email: (org as any).contact_email || 'N/A',
          phone: (org as any).contact_phone || 'N/A',
          created: org.created_at ? new Date(org.created_at as any).toLocaleDateString() : undefined,
        });
      }

      // Reports Submitted Today (actual reports)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: reportsToday } = await supabase
        .from('reports_submissions')
        .select('id', { count: 'exact' })
        .in('account_id', orgIds.length ? orgIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('account_type', 'organization')
        .gte('submitted_at', today.toISOString());

      // Reports by Organization over last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: reportRows } = await supabase
        .from('reports_submissions')
        .select('account_id, account_type')
        .in('account_id', orgIds.length ? orgIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('account_type', 'organization')
        .gte('submitted_at', thirtyDaysAgo.toISOString());

      const countsByOrg = new Map<string, number>();
      (reportRows || []).forEach((row: any) => {
        const orgId = row.account_id;
        countsByOrg.set(orgId, (countsByOrg.get(orgId) || 0) + 1);
      });
      const byOrg: ReportsByOrganizationDatum[] = (orgsData || []).map(org => ({
        orgId: org.id,
        orgName: org.name,
        count: countsByOrg.get(org.id) || 0,
      })).sort((a, b) => b.count - a.count);

      setEnterpriseData({
        id: tenant.id,
        name: tenant.name,
        description: (tenant.settings as any)?.description || 'Enterprise organization',
        totalOrganizations: orgIds.length,
        totalEnterpriseAdminsAndUsers,
        totalOrganizationPatrollers,
        reportsSubmittedToday: reportsToday || 0,
      });

      setOrganizations(organizationSummaries);
      setReportsByOrganization(byOrg);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [tenantId]);

  return { 
    enterpriseData, 
    organizations, 
    reportsByOrganization,
    loading, 
    refetch: fetchAnalyticsData 
  };
};