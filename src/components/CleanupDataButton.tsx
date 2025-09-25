import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cleanupDummyData } from "@/utils/cleanupDummyData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export function CleanupDataButton() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const {
    toast
  } = useToast();
  const handleCleanupData = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupDummyData();
      if (result.success) {
        const deletedCounts = result.data?.deleted_counts || {};
        const totalDeleted = Object.values(deletedCounts).reduce((sum: number, count: any) => sum + count, 0);
        toast({
          title: "Data Cleanup Complete",
          description: `Successfully deleted ${totalDeleted} records across all tables.`
        });

        // Refresh the page after cleanup to reset any cached data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Error Cleaning Up Data",
          description: result.error || "Failed to cleanup dummy data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error occurred during data cleanup.",
        variant: "destructive"
      });
    } finally {
      setIsCleaningUp(false);
    }
  };
  return <AlertDialog>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete ALL data from the platform including:
            users, organizations, tenants, reports, and audit logs.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCleanupData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
}