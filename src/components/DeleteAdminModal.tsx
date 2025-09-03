import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Admin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface DeleteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export function DeleteAdminModal({ 
  open, 
  onOpenChange, 
  admin,
  accountType,
  onSuccess 
}: DeleteAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!admin) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', admin.id);

      if (error) {
        console.error('Error deleting admin:', error);
        toast.error('Failed to delete administrator');
        return;
      }

      toast.success(`${admin.firstName} ${admin.lastName} has been removed`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete administrator');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (accountType) {
      case "platform": return "Delete Platform Admin";
      case "enterprise": return "Delete Enterprise Admin";
      case "organization": return "Delete Organization Admin";
      default: return "Delete Admin";
    }
  };

  if (!admin) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{admin.firstName} {admin.lastName}</strong>? 
            This action cannot be undone and will permanently remove their access to the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}