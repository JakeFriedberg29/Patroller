import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSeedAuthUsers } from "@/utils/seedAuthUsers";

export function SeedDataButton() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateSeedUsers = async () => {
    setIsCreating(true);
    
    try {
      const result = await createSeedAuthUsers();
      
      if (result.success) {
        toast({
          title: "Seed Users Created",
          description: `Successfully created ${result.data?.successful || 0} authentication users. You can now log in with their email addresses as passwords.`,
        });
      } else {
        toast({
          title: "Error Creating Users",
          description: result.error || "Failed to create seed authentication users.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error occurred while creating seed users.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateSeedUsers}
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          Create Auth Users
        </>
      )}
    </Button>
  );
}