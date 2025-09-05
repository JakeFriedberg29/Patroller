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
      // Log admin deletion attempt
      try {
        await supabase.rpc('log_user_action', {
          p_action: 'DELETE_ATTEMPT',
          p_resource_type: accountType + '_admin',
          p_resource_id: admin.id,
          p_metadata: {
            admin_email: admin.email,
            admin_name: `${admin.firstName} ${admin.lastName}`,
            admin_role: admin.role,
            deletion_method: 'soft_delete'
          }
        });
      } catch (logError) {
        console.warn('Failed to log admin deletion attempt:', logError);
      }

      // Soft delete by updating status to inactive
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);

      if (updateError) {
        console.error('Error deleting admin:', updateError);
        toast.error('Failed to delete admin');
        return;
      }

      // Deactivate user roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', admin.id);

      if (roleError) {
        console.error('Error deactivating roles:', roleError);
      }

      // Log successful admin deletion with detailed information
      try {
        await supabase.rpc('log_user_action', {
          p_action: 'DELETE',
          p_resource_type: 'user',
          p_resource_id: admin.id,
          p_old_values: {
            full_name: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
            status: 'active',
            role: admin.role
          },
          p_new_values: { status: 'inactive' },
          p_metadata: {
            target_admin_name: `${admin.firstName} ${admin.lastName}`,
            target_admin_email: admin.email,
            target_admin_role: admin.role,
            account_type: accountType,
            deletion_method: 'delete_modal',
            action_description: `Deleted admin '${admin.firstName} ${admin.lastName} (${admin.email})' with role '${admin.role}'`
          }
        });
      } catch (logError) {
        console.warn('Failed to log successful admin deletion:', logError);
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Admin Details:</p>
            <p className="text-sm">Name: {admin.firstName} {admin.lastName}</p>
            <p className="text-sm">Email: {admin.email}</p>
            <p className="text-sm">Role: {admin.role}</p>
          </div>
          
          <p className="text-destructive font-medium mt-4">
            This action cannot be easily undone.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Admin
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};