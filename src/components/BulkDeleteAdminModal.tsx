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
import { safeMutation } from "@/lib/safeMutation";
import { filterValidIds, UUID_ERROR_MESSAGES } from "@/lib/uuidValidation";

interface Admin {
  id: string;
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

    // Filter to only valid IDs and validate
    const validAdmins = filterValidIds(admins);
    
    if (validAdmins.length === 0) {
      console.error('No valid admin IDs found:', admins);
      toast.error(UUID_ERROR_MESSAGES.INVALID_USER);
      return;
    }
    
    if (validAdmins.length < admins.length) {
      console.warn(`${admins.length - validAdmins.length} invalid admin IDs filtered out`);
      toast.warning(`${admins.length - validAdmins.length} users skipped due to invalid IDs`);
    }

    setIsDeleting(true);
    
    const adminIds = validAdmins.map(admin => admin.id);
    
    const success = await safeMutation(
      `bulk-delete-admins-${adminIds.join(',')}`,
      {
        op: async () => {
          // Hard delete - remove users from database (cascade deletes will handle related records)
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .in('id', adminIds);

          if (deleteError) throw deleteError;
        },
        refetch: onSuccess ? async () => { onSuccess(); } : undefined,
        tags: { operation: 'bulk_delete_admins', count: admins.length.toString() },
        name: 'BulkDeleteAdmins',
        retry: { enabled: true, maxRetries: 2 },
        timeout: 15000
      }
    );
    
    setIsDeleting(false);
    
    if (success) {
      toast.success(`Successfully deleted ${admins.length} admin${admins.length > 1 ? 's' : ''}`);
      onOpenChange(false);
    } else {
      toast.error('Failed to delete admins. Please try again.');
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
            This action will permanently remove their accounts from the database.
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