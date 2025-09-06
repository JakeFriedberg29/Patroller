import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MissionControlData {
  totalUsers: number;
  totalLocations: number;
  totalEquipment: number;
  reportsPending: number;
  reportsApproved: number;
  reportsRejected: number;
  totalLogins: number;
  activeIncidents: number;
}

export const useMissionControlData = (organizationId?: string) => {
  const [data, setData] = useState<MissionControlData>({
    totalUsers: 0,
    totalLocations: 0,
    totalEquipment: 0,
    reportsPending: 0,
    reportsApproved: 0,
    reportsRejected: 0,
    totalLogins: 0,
    activeIncidents: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMissionControlData = async () => {
    if (!organizationId || organizationId === "undefined") return;
    
    try {
      setLoading(true);

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

      setData({
        totalUsers: usersCount || 0,
        totalLocations: locationsCount || 0,
        totalEquipment: equipmentCount || 0,
        reportsPending: 0, // Will implement when reports system is ready
        reportsApproved: 0,
        reportsRejected: 0,
        totalLogins: loginsCount || 0,
        activeIncidents: activeIncidentsCount || 0,
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
  }, [organizationId]);

  return { data, loading, refetch: fetchMissionControlData };
};