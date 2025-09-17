import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface Incident {
  id: string;
  title: string;
  description?: string;
  incident_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: string;
  organization_id: string;
  location_id?: string;
  reported_by: string;
  resolved_by?: string;
  occurred_at: string;
  resolved_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageIncidents, isPlatformAdmin, isEnterpriseAdmin, isOrganizationAdmin } = usePermissions();
  const { id: urlOrganizationId } = useParams();

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id, id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      let query = supabase.from('incidents').select('*');
      
      // Apply organization filtering based on user role
      if (isPlatformAdmin) {
        // Platform admins: use URL organization ID if valid, otherwise show all
        const urlOrgId = urlOrganizationId;
        console.log('Platform admin incidents fetch - URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          query = query.eq('organization_id', urlOrgId);
        }
        // If no specific org in URL, show all incidents (platform admin global view)
      } else if (isEnterpriseAdmin) {
        // Enterprise admins: see incidents from all organizations in their tenant
        // Use URL organization ID if specified, otherwise show tenant-wide incidents
        const urlOrgId = urlOrganizationId;
        if (isValidUuid(urlOrgId)) {
          query = query.eq('organization_id', urlOrgId);
        } else {
          // Show all incidents from organizations in this tenant
          const { data: orgIds } = await supabase
            .from('organizations')
            .select('id')
            .eq('tenant_id', currentUser?.tenant_id);
          
          if (orgIds && orgIds.length > 0) {
            query = query.in('organization_id', orgIds.map(org => org.id));
          }
        }
      } else if (currentUser?.organization_id) {
        // Regular users see only their organization's incidents
        query = query.eq('organization_id', currentUser.organization_id);
      } else {
        console.error('No organization context found. currentUser:', currentUser, 'urlOrganizationId:', urlOrganizationId, 'isPlatformAdmin:', isPlatformAdmin);
        setIncidents([]);
        return;
      }
      
      const { data, error } = await query.order('occurred_at', { ascending: false });
      
      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: "Failed to load incidents data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData: any) => {
    try {
      // Get current user's organization info
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id, id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      // Determine target organization
      let targetOrgId = currentUser?.organization_id;
      
      // For platform or enterprise admins, use URL organization ID if available and valid
      if (isPlatformAdmin || isEnterpriseAdmin) {
        const urlOrgId = urlOrganizationId;
        console.log('Admin creating incident - URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          targetOrgId = urlOrgId;
        } else {
          console.error("Admin: Invalid organization ID in URL:", urlOrgId);
          throw new Error("Invalid organization ID in URL");
        }
      }

      if (!isValidUuid(targetOrgId)) {
        console.error('No valid organization context found. currentUser:', currentUser, 'urlOrganizationId:', urlOrganizationId, 'isPlatformAdmin:', isPlatformAdmin);
        throw new Error('No organization context found');
      }

      const cleanedData = {
        ...incidentData,
        organization_id: targetOrgId,
        reported_by: currentUser?.id,
        occurred_at: incidentData.occurred_at || new Date().toISOString(),
        status: incidentData.status || 'open'
      };

      const { error } = await supabase
        .from('incidents')
        .insert(cleanedData);

      if (error) throw error;

      toast({
        title: "Incident Created",
        description: "New incident has been reported successfully",
      });

      // Refresh the incidents list
      fetchIncidents();
      return true;
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    // Check if user has permission - Platform, Enterprise, or Organization admin
    const canEdit = isPlatformAdmin || isEnterpriseAdmin || isOrganizationAdmin;
    
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit incidents",
        variant: "destructive"
      });
      return false;
    }

    try {
      // If resolving incident, set resolved_at and resolved_by
      if (updates.status === 'resolved' || updates.status === 'closed') {
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = currentUser?.id;
      }

      const { error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Incident Updated",
        description: "Incident has been updated successfully",
      });

      // Refresh the incidents list
      fetchIncidents();
      return true;
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [urlOrganizationId, isPlatformAdmin]);

  return {
    incidents,
    loading,
    fetchIncidents,
    createIncident,
    updateIncident,
    canManageIncidents
  };
};