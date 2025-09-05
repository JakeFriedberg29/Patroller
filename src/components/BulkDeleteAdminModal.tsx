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
import { Badge } from "@/components/ui/badge";
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

interface BulkDeleteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins: Admin[];
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export const BulkDeleteAdminModal = ({
  open,
  onOpenChange,
  admins,
  accountType,
  onSuccess
}: BulkDeleteAdminModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (admins.length === 0) return;

    setIsDeleting(true);
    try {
      const adminIds = admins.map(admin => admin.id);

      // Soft delete by updating status
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .in('id', adminIds);

      if (updateError) {
        console.error('Error bulk deleting admins:', updateError);
        toast.error('Failed to delete admins');
        return;
      }

      // Deactivate user roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .in('user_id', adminIds);

      if (roleError) {
        console.error('Error deactivating roles:', roleError);
      }

      toast.success(`Successfully deleted ${admins.length} admin${admins.length > 1 ? 's' : ''}`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error bulk deleting admins:', error);
      toast.error('Failed to delete admins');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold">
                Delete Multiple {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Admins
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-base">
          <p className="mb-4">
            Are you sure you want to delete <strong>{admins.length} admin{admins.length > 1 ? 's' : ''}</strong>? 
            This action will deactivate their accounts and revoke all administrative privileges.
          </p>
          
          <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Admins to be deleted:</p>
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between text-sm">
                  <span>{admin.firstName} {admin.lastName}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {admin.email}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {admin.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting {admins.length} Admin{admins.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {admins.length} Admin{admins.length > 1 ? 's' : ''}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};