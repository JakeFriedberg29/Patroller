import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface ReportRecord {
  id: string;
  tenant_id: string;
  account_id: string;
  account_type: 'enterprise' | 'organization';
  template_id?: string | null;
  template_version?: number | null;
  title: string | null;
  description: string | null;
  report_type: string;
  created_by: string | null;
  incident_id?: string | null;
  metadata?: any | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

function isValidUuid(id: string | undefined | null): boolean {
  return !!(id && id !== 'undefined' && id !== 'null' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
}

export const useReports = () => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isPlatformAdmin, isEnterpriseUser, isOrganizationUser, isResponder, canSubmitReports } = usePermissions();
  const { id: urlOrganizationId } = useParams();

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Load current user and tenancy
      const { data: authUser } = await supabase.auth.getUser();
      const authUserId = authUser.user?.id;
      const { data: currentUser } = await supabase
        .from('users')
        .select('id, tenant_id, organization_id')
        .eq('auth_user_id', authUserId)
        .single();

      let query = supabase.from('reports').select('*');

      if (isPlatformAdmin) {
        // Platform admins: optionally scope to URL org if provided
        if (isValidUuid(urlOrganizationId)) {
          query = query.eq('account_type', 'organization').eq('account_id', urlOrganizationId as string);
        }
      } else if (isEnterpriseUser) {
        // Enterprise users: all reports across their tenant, optionally scoped by URL org
        if (isValidUuid(urlOrganizationId)) {
          query = query.eq('account_type', 'organization').eq('account_id', urlOrganizationId as string);
        } else {
          query = query.eq('tenant_id', currentUser?.tenant_id || '');
        }
      } else if (isOrganizationUser || isResponder) {
        // Org users/responders: only their organization's reports
        if (isValidUuid(currentUser?.organization_id)) {
          query = query.eq('account_type', 'organization').eq('account_id', currentUser!.organization_id!);
        } else {
          setReports([]);
          return;
        }
      } else {
        // View-only or unknown: no access
        setReports([]);
        return;
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });
      if (error) throw error;
      setReports((data as any) || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (payload: {
    title?: string | null;
    description?: string | null;
    report_type: string;
    incident_id?: string | null;
    metadata?: any | null;
    template_id?: string | null;
    template_version?: number | null;
    account_scope?: { type: 'organization' | 'enterprise'; id: string };
  }): Promise<boolean> => {
    try {
      if (!canSubmitReports) {
        toast({ title: 'Permission denied', description: "You can't submit reports.", variant: 'destructive' });
        return false;
      }

      const { data: authUser } = await supabase.auth.getUser();
      const authUserId = authUser.user?.id;
      const { data: currentUser, error: userErr } = await supabase
        .from('users')
        .select('id, tenant_id, organization_id')
        .eq('auth_user_id', authUserId)
        .single();
      if (userErr || !currentUser) throw userErr || new Error('Current user not found');

      // Determine account scope
      let accountType: 'organization' | 'enterprise' = 'organization';
      let accountId: string | undefined = undefined;

      if (payload.account_scope) {
        accountType = payload.account_scope.type;
        accountId = payload.account_scope.id;
      } else {
        // Default: use URL org id if valid; otherwise current user's org
        if (isValidUuid(urlOrganizationId)) {
          accountType = 'organization';
          accountId = urlOrganizationId as string;
        } else if (isValidUuid(currentUser.organization_id)) {
          accountType = 'organization';
          accountId = currentUser.organization_id as string;
        }
      }

      if (!isValidUuid(accountId)) {
        throw new Error('No valid account context to create report');
      }

      // Optional: ensure org belongs to same tenant (defense in depth)
      if (accountType === 'organization') {
        await supabase.rpc('assert_record_matches_org_tenant', {
          p_org_id: accountId,
          p_tenant_id: currentUser.tenant_id,
        });
      }

      const insertData = {
        tenant_id: currentUser.tenant_id,
        account_id: accountId!,
        account_type: accountType,
        template_id: payload.template_id ?? null,
        template_version: payload.template_version ?? null,
        title: payload.title ?? null,
        description: payload.description ?? null,
        report_type: payload.report_type,
        created_by: currentUser.id,
        incident_id: payload.incident_id ?? null,
        metadata: payload.metadata ?? null,
        submitted_at: new Date().toISOString(),
      } as const;

      const { error } = await supabase.from('reports').insert(insertData);
      if (error) throw error;

      toast({ title: 'Report submitted', description: 'Your report has been created.' });
      await fetchReports();
      return true;
    } catch (err) {
      console.error('Error creating report:', err);
      toast({ title: 'Error', description: 'Failed to submit report', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlOrganizationId, isPlatformAdmin, isEnterpriseUser, isOrganizationUser, isResponder]);

  return {
    reports,
    loading,
    fetchReports,
    createReport,
    canSubmitReports,
  };
};
