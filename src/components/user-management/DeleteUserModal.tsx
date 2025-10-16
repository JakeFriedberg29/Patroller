import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeMutation } from "@/lib/safeMutation";
import { isValidUUID, UUID_ERROR_MESSAGES } from "@/lib/uuidValidation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export function DeleteUserModal({
  open,
  onOpenChange,
  user,
  accountType,
  onSuccess
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    
    // UUID validation
    if (!isValidUUID(user.id)) {
      console.error('Invalid user ID:', user.id);
      toast.error(UUID_ERROR_MESSAGES.INVALID_USER);
      return;
    }
    
    setIsDeleting(true);
    
    const success = await safeMutation(
      `delete-user-${user.id}`,
      {
        op: async () => {
          // Hard delete - remove user from database (cascade deletes will handle related records)
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          if (deleteError) throw deleteError;
        },
        refetch: onSuccess ? async () => { onSuccess(); } : undefined,
        tags: { operation: 'delete_user', user_id: user.id },
        name: 'DeleteUser',
        retry: { enabled: true, maxRetries: 2 },
        timeout: 10000
      }
    );
    
    setIsDeleting(false);
    
    if (success) {
      toast.success(`${user.firstName} ${user.lastName} has been deleted successfully`);
      onOpenChange(false);
    } else {
      toast.error('Failed to delete user. Please try again.');
    }
  };

  if (!user) return null;

  const accountTypeLabel = accountType.charAt(0).toUpperCase() + accountType.slice(1);

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
                Delete {accountTypeLabel} User
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-base">
          Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>? 
          This action will permanently remove their account from the database.
          
          <p className="text-destructive font-medium mt-4">
            This action cannot be undone.
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
                Delete User
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
