import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'damaged' | 'retired';
  location_id?: string;
  assigned_to?: string;
  organization_id: string;
  specifications?: any;
  maintenance_schedule?: any;
  purchase_date?: string;
  warranty_expires?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  created_at: string;
  updated_at: string;
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageEquipment, isPlatformAdmin } = usePermissions();
  const { id: urlOrganizationId } = useParams();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      let query = supabase.from('equipment').select('*');
      
      // Apply organization filtering based on user role
      if (isPlatformAdmin) {
        // Platform admins see all equipment, optionally filtered by URL organization
        if (urlOrganizationId && urlOrganizationId !== 'undefined' && urlOrganizationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          query = query.eq('organization_id', urlOrganizationId);
        }
        // If no specific org in URL, show all equipment (platform admin view)
      } else if (currentUser?.organization_id) {
        // Regular users see only their organization's equipment
        query = query.eq('organization_id', currentUser.organization_id);
      } else {
        console.error('No organization context found. currentUser:', currentUser, 'urlOrganizationId:', urlOrganizationId, 'isPlatformAdmin:', isPlatformAdmin);
        setEquipment([]);
        return;
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    if (!canManageEquipment) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit equipment",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Equipment Updated",
        description: "Equipment has been updated successfully",
      });

      // Refresh the equipment list
      fetchEquipment();
      return true;
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive"
      });
      return false;
    }
  };

  const createEquipment = async (equipmentData: any) => {
    if (!canManageEquipment) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create equipment",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Get current user's organization info
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Determine target organization
      let targetOrgId = currentUser?.organization_id;
      
      // For platform admins, get organization from URL if not set
      if (isPlatformAdmin && !targetOrgId && urlOrganizationId) {
        // Validate that it's not "undefined" and is a valid UUID format
        if (urlOrganizationId !== 'undefined' && urlOrganizationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          targetOrgId = urlOrganizationId;
        } else {
          console.error("Invalid organization ID in URL:", urlOrganizationId);
          throw new Error("Invalid organization ID in URL");
        }
      }

      if (!targetOrgId) {
        console.error('No organization context found. currentUser:', currentUser, 'urlOrganizationId:', urlOrganizationId, 'isPlatformAdmin:', isPlatformAdmin);
        throw new Error('No organization context found');
      }

      // Clean up date fields - convert empty strings to null to prevent database errors
      const cleanedData = {
        ...equipmentData,
        purchase_date: equipmentData.purchase_date === '' ? null : equipmentData.purchase_date,
        warranty_expires: equipmentData.warranty_expires === '' ? null : equipmentData.warranty_expires,
        last_maintenance: equipmentData.last_maintenance === '' ? null : equipmentData.last_maintenance,
        next_maintenance: equipmentData.next_maintenance === '' ? null : equipmentData.next_maintenance,
        organization_id: targetOrgId
      };

      const { error } = await supabase
        .from('equipment')
        .insert(cleanedData);

      if (error) throw error;

      toast({
        title: "Equipment Created",
        description: "New equipment has been added successfully",
      });

      // Refresh the equipment list
      fetchEquipment();
      return true;
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to create equipment",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!canManageEquipment) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete equipment",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Equipment Deleted",
        description: "Equipment has been deleted successfully",
      });

      // Refresh the equipment list
      fetchEquipment();
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    fetchEquipment,
    updateEquipment,
    createEquipment,
    deleteEquipment,
    canManageEquipment
  };
};