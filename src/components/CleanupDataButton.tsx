import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CleanupDataButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-dummy-data', {
        body: {}
      });
      
      if (error) {
        toast({
          title: "Error Cleaning Data",
          description: error.message || "Failed to clean up dummy data.",
          variant: "destructive",
        });
      } else if (data.success) {
        const counts = data.deleted_counts;
        const totalDeleted = Object.values(counts).reduce((sum: number, count: any) => sum + count, 0);
        
        toast({
          title: "Data Cleaned Successfully",
          description: `Deleted ${totalDeleted} records across all tables. The platform is now clean.`,
        });
      } else {
        toast({
          title: "Cleanup Failed",
          description: data.error || "Failed to clean up dummy data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error occurred while cleaning data.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clean All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Dummy Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete ALL data from the platform including:
            users, organizations, tenants, incidents, equipment, locations, and all related records.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCleanup}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete All Data"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}