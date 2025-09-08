import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Account } from "@/hooks/useAccounts";

interface DeleteAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export function DeleteAccountModal({ account, isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!account) return null;

  const expectedText = account.name;
  const isConfirmationValid = confirmationText === expectedText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;
    
    setIsDeleting(true);
    try {
      const success = await onConfirm(account.id);
      if (success) {
        onClose();
        setConfirmationText("");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setConfirmationText("");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete {account.type}</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive mb-2">What will happen:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {account.type} "{account.name}" will be deactivated</li>
              <li>• All team members will lose access</li>
              {account.type === 'Enterprise' && (
                <li>• All organizations under this enterprise will be affected</li>
              )}
              <li>• Data will be preserved but inaccessible</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-mono font-semibold">{expectedText}</span> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedText}
              className="font-mono"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}