import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createSeedAuthUsers } from "@/utils/seedAuthUsers";

export function useSeedData() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createAuthUsers = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting seed auth users creation...');
      const result = await createSeedAuthUsers();
      
      if (result.success) {
        const message = result.data?.skipped > 0 && result.data?.successful === 0 
          ? `No new authentication accounts needed. All ${result.data.skipped} seed users already have auth accounts.`
          : `Successfully created ${result.data?.successful || 0} new authentication accounts!`;
          
        toast({
          title: result.data?.successful > 0 ? "Auth Users Created!" : "All Set!",
          description: message,
        });
        console.log('Seed auth users creation completed:', result.data);
      } else {
        toast({
          title: "Error Creating Seed Users",
          description: result.error || "Failed to create seed authentication users.",
          variant: "destructive",
        });
        console.error('Error creating seed users:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error in createAuthUsers:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating seed users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAuthUsers,
    isLoading
  };
}