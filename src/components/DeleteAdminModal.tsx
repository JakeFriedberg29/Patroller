import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
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
export const DeleteAdminModal = ({
  open,
  onOpenChange,
  admin,
  accountType,
  onSuccess
}: DeleteAdminModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (!admin) return;
    setIsDeleting(true);
    try {
      // Soft delete by updating status to inactive
      const {
        error: updateError
      } = await supabase.from('users').update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      }).eq('id', admin.id);
      if (updateError) {
        console.error('Error deleting admin:', updateError);
        toast.error('Failed to delete admin');
        return;
      }

      // Deactivate user roles
      const {
        error: roleError
      } = await supabase.from('user_roles').update({
        is_active: false
      }).eq('user_id', admin.id);
      if (roleError) {
        console.error('Error deactivating roles:', roleError);
      }
      toast.success(`${admin.firstName} ${admin.lastName} has been deleted successfully`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setIsDeleting(false);
    }
  };
  if (!admin) return null;
  return <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold">
                Delete {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Admin
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-base">
          Are you sure you want to delete <strong>{admin.firstName} {admin.lastName}</strong>? 
          This action will deactivate their account and revoke all administrative privileges.
          
          
          
          <p className="text-destructive font-medium mt-4">
            This action cannot be easily undone.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </> : <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Admin
              </>}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
};