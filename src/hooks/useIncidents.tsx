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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { canManageIncidents } = usePermissions();

  const fetchIncidents = async () => {
    // Since incidents table doesn't exist, return empty array
    setIncidents([]);
  };

  const createIncident = async (incidentData: any) => {
    toast({
      title: "Feature Unavailable",
      description: "Incident management is not available",
      variant: "destructive"
    });
    return false;
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    toast({
      title: "Feature Unavailable", 
      description: "Incident management is not available",
      variant: "destructive"
    });
    return false;
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents,
    loading,
    fetchIncidents,
    createIncident,
    updateIncident,
    canManageIncidents
  };
};