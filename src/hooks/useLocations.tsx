import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface Location {
  id: string;
  name: string;
  description?: string;
  address: any;
  coordinates?: string;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageLocations } = usePermissions();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      let query = supabase.from('locations').select('*');
      
      // RLS policies will handle filtering automatically
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setLocations((data || []) as Location[]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (locationData: {
    name: string;
    description?: string;
    address: any;
    coordinates?: string;
  }) => {
    try {
      if (!canManageLocations) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to create locations",
          variant: "destructive"
        });
        return false;
      }

      // Get current user's organization
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!currentUser?.organization_id) {
        throw new Error('No organization found for current user');
      }

      const { error } = await supabase
        .from('locations')
        .insert({
          name: locationData.name,
          description: locationData.description,
          address: locationData.address,
          coordinates: locationData.coordinates,
          organization_id: currentUser.organization_id,
        });

      if (error) throw error;

      toast({
        title: "Location Created",
        description: `${locationData.name} has been created successfully`,
      });

      fetchLocations();
      return true;
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      if (!canManageLocations) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to update locations",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Location Updated",
        description: "Location has been updated successfully",
      });

      fetchLocations();
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      if (!canManageLocations) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to delete locations",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Location Deleted",
        description: "Location has been deleted successfully",
      });

      fetchLocations();
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    canManageLocations,
  };
};