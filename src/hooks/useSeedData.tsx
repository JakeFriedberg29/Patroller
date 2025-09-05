import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSeedData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createAuthUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-seed-auth-users', {});

      if (error) {
        console.error('Error creating auth users:', error);
        toast({
          title: "Error Creating Auth Users",
          description: error.message || "Failed to create authentication users",
          variant: "destructive",
        });
        return false;
      }

      console.log('Auth users creation result:', data);
      
      if (data?.success) {
        toast({
          title: "Auth Users Created Successfully",
          description: data.message || "All authentication users have been created",
        });
        return true;
      } else {
        toast({
          title: "Error Creating Auth Users",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
        return false;
      }

    } catch (error) {
      console.error('Exception calling create-seed-auth-users:', error);
      toast({
        title: "Error Creating Auth Users",
        description: "Failed to call the user creation function",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAuthUsers,
    isLoading
  };
};