import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DateRange } from 'react-day-picker';

export interface MissionControlData {
  totalUsers: number;
  totalLocations: number;
  totalEquipment: number;
  totalReportsSubmitted: number;
  avgTimeToReportHours: number;
  totalLogins: number;
  activeIncidents: number;
  // Charts
  reportsByType: { type: string; count: number }[];
  incidentsByType: { type: string; count: number }[];
  incidentsRequiresLegal: { category: string; count: number }[];
  incidentsRequiresHospitalization: { category: string; count: number }[];
}

export const useMissionControlData = (organizationId?: string, dateRange?: DateRange) => {
  const [data, setData] = useState<MissionControlData>({
    totalUsers: 0,
    totalLocations: 0,
    totalEquipment: 0,
    totalReportsSubmitted: 0,
    avgTimeToReportHours: 0,
    totalLogins: 0,
    activeIncidents: 0,
    reportsByType: [],
    incidentsByType: [],
    incidentsRequiresLegal: [],
    incidentsRequiresHospitalization: [],
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

      // Fetch locations count
      const { count: locationsCount } = await supabase
        .from('locations')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      // Fetch equipment count
      const { count: equipmentCount } = await supabase
        .from('equipment')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Fetch incidents count
      const { count: activeIncidentsCount } = await supabase
        .from('incidents')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'open');

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
        .from('reports')
        .select('id, report_type, submitted_at, incident_id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .gte('submitted_at', fromIso)
        .lte('submitted_at', toIso);

      // Aggregate reports by type
      const reportsByTypeMap = new Map<string, number>();
      (reportRows || []).forEach((r: any) => {
        const key = r.report_type || 'Unknown';
        reportsByTypeMap.set(key, (reportsByTypeMap.get(key) || 0) + 1);
      });
      const reportsByType = Array.from(reportsByTypeMap.entries()).map(([type, count]) => ({ type, count }));

      // Incidents in date range
      const { data: incidentRows } = await supabase
        .from('incidents')
        .select('id, incident_type, occurred_at, requires_legal, requires_hospitalization')
        .eq('organization_id', organizationId)
        .gte('occurred_at', fromIso)
        .lte('occurred_at', toIso);

      // Aggregate incidents by type
      const incidentsByTypeMap = new Map<string, number>();
      (incidentRows || []).forEach((i: any) => {
        const key = i.incident_type || 'Unknown';
        incidentsByTypeMap.set(key, (incidentsByTypeMap.get(key) || 0) + 1);
      });
      const incidentsByType = Array.from(incidentsByTypeMap.entries()).map(([type, count]) => ({ type, count }));

      // Legal and Hospitalization counts
      const legalCount = (incidentRows || []).filter((i: any) => i.requires_legal).length;
      const nonLegalCount = (incidentRows || []).length - legalCount;
      const hospCount = (incidentRows || []).filter((i: any) => i.requires_hospitalization).length;
      const nonHospCount = (incidentRows || []).length - hospCount;

      const incidentsRequiresLegal = [
        { category: 'Requires Legal', count: legalCount },
        { category: 'No Legal', count: nonLegalCount },
      ];
      const incidentsRequiresHospitalization = [
        { category: 'Hospitalization', count: hospCount },
        { category: 'No Hospitalization', count: nonHospCount },
      ];

      // Average time to report (in hours) for reports linked to incidents
      const reportsWithIncidents = (reportRows || []).filter((r: any) => !!r.incident_id);
      let avgTimeToReportHours = 0;
      if (reportsWithIncidents.length > 0) {
        const incidentIds = Array.from(new Set(reportsWithIncidents.map((r: any) => r.incident_id)));
        const { data: relatedIncidents } = await supabase
          .from('incidents')
          .select('id, occurred_at')
          .in('id', incidentIds);
        const incidentMap = new Map<string, string>();
        (relatedIncidents || []).forEach((i: any) => incidentMap.set(i.id, i.occurred_at));
        const diffsMs: number[] = reportsWithIncidents
          .map((r: any) => ({ submitted_at: r.submitted_at, occurred_at: incidentMap.get(r.incident_id) }))
          .filter((x: any) => !!x.submitted_at && !!x.occurred_at)
          .map((x: any) => new Date(x.submitted_at).getTime() - new Date(x.occurred_at).getTime())
          .filter((ms: number) => ms >= 0);
        if (diffsMs.length > 0) {
          avgTimeToReportHours = Math.round((diffsMs.reduce((a, b) => a + b, 0) / diffsMs.length) / (1000 * 60 * 60));
        }
      }

      setData({
        totalUsers: usersCount || 0,
        totalLocations: locationsCount || 0,
        totalEquipment: equipmentCount || 0,
        totalReportsSubmitted: reportsCount || 0,
        avgTimeToReportHours,
        totalLogins: loginsCount || 0,
        activeIncidents: activeIncidentsCount || 0,
        reportsByType,
        incidentsByType,
        incidentsRequiresLegal,
        incidentsRequiresHospitalization,
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