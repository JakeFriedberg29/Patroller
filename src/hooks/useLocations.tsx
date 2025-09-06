import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { toast } = useToast();
  const { isPlatformAdmin, canManageLocations } = usePermissions();
  const params = useParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      let query = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true);

      // Apply organization filtering based on user role
      if (isPlatformAdmin) {
        // Platform admins: use URL organization ID if valid, otherwise show all
        const urlOrgId = params.id;
        console.log('Platform admin locations fetch - URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          query = query.eq('organization_id', urlOrgId);
        }
        // If no specific org in URL, show all locations (platform admin global view)
      } else if (currentUser?.organization_id) {
        // Regular users see only their organization's locations
        query = query.eq('organization_id', currentUser.organization_id);
      } else {
        console.error('No organization context found. currentUser:', currentUser, 'params.id:', params.id, 'isPlatformAdmin:', isPlatformAdmin);
        setLocations([]);
        return;
      }
      
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

      // Get current user's info
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      let organizationId = currentUser?.organization_id;

      // For platform admins, ALWAYS use URL organization ID if available and valid
      if (isPlatformAdmin) {
        const urlOrgId = params.id;
        console.log('Platform admin creating location - URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          organizationId = urlOrgId;
        } else {
          console.error("Platform admin: Invalid organization ID in URL:", urlOrgId);
          throw new Error("Invalid organization ID in URL");
        }
      }

      console.log('Create location context:', {
        isPlatformAdmin,
        currentUserOrgId: currentUser?.organization_id,
        urlOrgId: params.id,
        finalOrgId: organizationId
      });

      if (!isValidUuid(organizationId)) {
        console.error('No valid organization context found. currentUser:', currentUser, 'params.id:', params.id, 'isPlatformAdmin:', isPlatformAdmin);
        throw new Error('No organization context found');
      }

      // Process coordinates - convert to proper point format or set to null
      let processedCoordinates = null;
      if (locationData.coordinates && typeof locationData.coordinates === 'string') {
        // Skip processing if coordinates is just a string that doesn't contain valid numbers
        const coordParts = locationData.coordinates.split(',').map(part => {
          const trimmed = part.trim();
          const num = parseFloat(trimmed);
          return isNaN(num) ? null : num;
        }).filter(n => n !== null);
        
        if (coordParts.length === 2) {
          processedCoordinates = `(${coordParts[0]},${coordParts[1]})`;
        }
      }

      const { error } = await supabase
        .from('locations')
        .insert({
          name: locationData.name,
          description: locationData.description,
          address: locationData.address,
          coordinates: processedCoordinates,
          organization_id: organizationId,
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