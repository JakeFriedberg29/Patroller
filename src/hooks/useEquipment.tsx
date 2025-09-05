import { useState, useEffect } from 'react';
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
  created_at: string;
  updated_at: string;
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageEquipment, isPlatformAdmin } = usePermissions();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      let query = supabase.from('equipment').select('*');
      
      // RLS policies will handle filtering automatically based on user permissions
      // Platform admins can see all, others see only their organization's equipment
      
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

  const createEquipment = async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!canManageEquipment) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create equipment",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .insert(equipmentData);

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