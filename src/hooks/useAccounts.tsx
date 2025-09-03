import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Account {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  location?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateAccountRequest {
  name: string;
  type: string;
  category: string;
  location?: string;
  contact_email?: string;
  status?: string;
}

export interface UpdateAccountRequest extends CreateAccountRequest {
  id: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to fetch accounts');
        return;
      }

      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (accountData: CreateAccountRequest) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          ...accountData,
          status: accountData.status || 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating account:', error);
        toast.error('Failed to create account');
        return { success: false, error: error.message };
      }

      toast.success('Account created successfully');
      await fetchAccounts(); // Refresh the list
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccount = async (accountData: UpdateAccountRequest) => {
    setIsLoading(true);
    try {
      const { id, ...updateData } = accountData;
      const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating account:', error);
        toast.error('Failed to update account');
        return { success: false, error: error.message };
      }

      toast.success('Account updated successfully');
      await fetchAccounts(); // Refresh the list
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
        return { success: false, error: error.message };
      }

      toast.success('Account deleted successfully');
      await fetchAccounts(); // Refresh the list
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts
  };
};