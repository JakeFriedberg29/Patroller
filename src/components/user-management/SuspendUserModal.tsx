import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  activation_status: "pending" | "active" | "disabled" | "deleted";
}

interface SuspendUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isSuspending: boolean;
  onConfirm: () => void;
}

export function SuspendUserModal({
  open,
  onOpenChange,
  user,
  isSuspending,
  onConfirm
}: SuspendUserModalProps) {
  if (!user) return null;

  const isDisabled = user.activation_status === 'disabled';
  const action = isDisabled ? 'Enable' : 'Disable';
  const actionVerb = isDisabled ? 'enable' : 'disable';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <AlertDialogTitle>
                {action} User
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isDisabled 
                  ? `Are you sure you want to enable ${user.firstName} ${user.lastName}? They will be able to log in and access the platform again.`
                  : `Are you sure you want to disable ${user.firstName} ${user.lastName}? They will not be able to log in until enabled.`
                }
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSuspending}
            className={!isDisabled ? "bg-yellow-600 hover:bg-yellow-700" : ""}
          >
            {isSuspending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {action}ing...
              </>
            ) : (
              `${action} User`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
