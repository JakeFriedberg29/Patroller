import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DateRange } from 'react-day-picker';

export interface MissionControlData {
  totalUsers: number;
  totalReportsSubmitted: number;
  avgTimeToReportHours: number;
  totalLogins: number;
  // Charts
  reportsByType: { type: string; count: number }[];
}

export const useMissionControlData = (organizationId?: string, dateRange?: DateRange) => {
  const [data, setData] = useState<MissionControlData>({
    totalUsers: 0,
    totalReportsSubmitted: 0,
    avgTimeToReportHours: 0,
    totalLogins: 0,
    reportsByType: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMissionControlData = async () => {
    if (!organizationId || organizationId === "undefined") return;
    
    try {
      setLoading(true);

      const fromDate = dateRange?.from ? new Date(dateRange.from) : new Date(new Date().getFullYear(), 0, 1);
      const toDate = dateRange?.to ? new Date(dateRange.to) : new Date();
      const fromIso = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toISOString();
      const toIso = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999).toISOString();

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      // Fetch recent logins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: loginsCount } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'LOGIN')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Reports submitted in date range
      const { data: reportRows, count: reportsCount } = await supabase
        .from('reports_submissions')
        .select('id, report_type, submitted_at, account_id, account_type', { count: 'exact' })
        .eq('account_type', 'organization')
        .eq('account_id', organizationId)
        .gte('submitted_at', fromIso)
        .lte('submitted_at', toIso);

      // Aggregate reports by type
      const reportsByTypeMap = new Map<string, number>();
      (reportRows || []).forEach((r: any) => {
        const key = r.report_type || 'Unknown';
        reportsByTypeMap.set(key, (reportsByTypeMap.get(key) || 0) + 1);
      });
      const reportsByType = Array.from(reportsByTypeMap.entries()).map(([type, count]) => ({ type, count }));

      // Average time to report (in hours) for reports linked to incidents (skip if incidents removed)
      const reportsWithIncidents = (reportRows || []).filter((r: any) => !!r.incident_id);
      let avgTimeToReportHours = 0;
      if (reportsWithIncidents.length > 0) {
        const diffsMs: number[] = [];
        if (diffsMs.length > 0) {
          avgTimeToReportHours = Math.round((diffsMs.reduce((a, b) => a + b, 0) / diffsMs.length) / (1000 * 60 * 60));
        }
      }

      setData({
        totalUsers: usersCount || 0,
        totalReportsSubmitted: reportsCount || 0,
        avgTimeToReportHours,
        totalLogins: loginsCount || 0,
        reportsByType,
      });

    } catch (error) {
      console.error('Error fetching mission control data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionControlData();
  }, [organizationId, dateRange?.from?.toString(), dateRange?.to?.toString()]);

  return { data, loading, refetch: fetchMissionControlData };
};