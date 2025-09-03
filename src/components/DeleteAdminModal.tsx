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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, User, Shield, Building2 } from "lucide-react";

interface Admin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  activation_status?: string;
  department?: string;
  location?: string;
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
  const [step, setStep] = useState<'confirm' | 'details' | 'final'>('confirm');
  const [confirmationText, setConfirmationText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [hardDelete, setHardDelete] = useState(false);
  const [understoodConsequences, setUnderstoodConsequences] = useState(false);

  const resetModal = () => {
    setStep('confirm');
    setConfirmationText('');
    setDeletionReason('');
    setHardDelete(false);
    setUnderstoodConsequences(false);
  };

  const expectedConfirmText = admin ? `${admin.firstName} ${admin.lastName}` : '';
  const isConfirmationValid = confirmationText.trim().toLowerCase() === expectedConfirmText.toLowerCase();

  const handleConfirmDelete = async () => {
    if (!admin || !isConfirmationValid || !understoodConsequences) return;
    
    setIsLoading(true);
    try {
      // Use the enhanced deletion function with audit logging
      const { data, error } = await supabase.rpc('delete_admin_with_audit', {
        p_admin_id: admin.id,
        p_deletion_reason: deletionReason || 'Administrative action',
        p_hard_delete: hardDelete
      });

      if (error) {
        console.error('Error deleting admin:', error);
        toast.error('Failed to delete administrator');
        return;
      }

      const result = data as { success: boolean; error?: string; message?: string };
      if (!result.success) {
        toast.error(result.error || 'Failed to delete administrator');
        return;
      }

      toast.success(result.message || 'Administrator deleted successfully');
      resetModal();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete administrator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'confirm' && isConfirmationValid) {
      setStep('details');
    } else if (step === 'details') {
      setStep('final');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('confirm');
    } else if (step === 'final') {
      setStep('details');
    }
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const getTitle = () => {
    const baseTitle = step === 'confirm' ? 'Confirm Deletion' :
                     step === 'details' ? 'Deletion Details' : 'Final Confirmation';
    const adminType = accountType === "platform" ? "Platform Admin" :
                     accountType === "enterprise" ? "Enterprise Admin" : "Organization Admin";
    return `${baseTitle} - ${adminType}`;
  };

  const getIcon = () => {
    switch (accountType) {
      case "platform": return <Shield className="h-5 w-5" />;
      case "enterprise": return <Building2 className="h-5 w-5" />;
      case "organization": return <User className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  if (!admin) return null;

  // Step 1: Initial confirmation
  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </DialogTitle>
            <DialogDescription>
              You are about to delete an administrator account. Please confirm your action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Administrator Details</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {admin.firstName} {admin.lastName}</div>
                <div><strong>Email:</strong> {admin.email}</div>
                <div><strong>Role:</strong> 
                  <Badge variant="outline" className="ml-2">{admin.role}</Badge>
                </div>
                {admin.activation_status && (
                  <div><strong>Status:</strong> 
                    <Badge variant="secondary" className="ml-2">{admin.activation_status}</Badge>
                  </div>
                )}
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                To proceed, please type the administrator's full name: <strong>{expectedConfirmText}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type administrator name to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={expectedConfirmText}
                className={isConfirmationValid ? "border-green-500" : ""}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isConfirmationValid}
              variant="destructive"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Deletion details
  if (step === 'details') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </DialogTitle>
            <DialogDescription>
              Provide details about this deletion for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for deletion *</Label>
              <Textarea
                id="reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Please explain why this administrator is being deleted..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hardDelete" 
                  checked={hardDelete}
                  onCheckedChange={(checked) => setHardDelete(checked as boolean)}
                />
                <Label htmlFor="hardDelete" className="text-sm">
                  Permanent deletion (cannot be recovered)
                </Label>
              </div>
              
              {!hardDelete && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Soft deletion will deactivate the account but preserve data for audit purposes.
                  </AlertDescription>
                </Alert>
              )}
              
              {hardDelete && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Warning:</strong> Permanent deletion will completely remove all data. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!deletionReason.trim()}
              variant="destructive"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Final confirmation
  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Final Confirmation
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to {hardDelete ? 'permanently delete' : 'deactivate'} <strong>{admin.firstName} {admin.lastName}</strong>.
            
            <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
              <div><strong>Action:</strong> {hardDelete ? 'Permanent Deletion' : 'Account Deactivation'}</div>
              <div><strong>Reason:</strong> {deletionReason}</div>
              <div><strong>Reversible:</strong> {hardDelete ? 'No' : 'Yes (can be reactivated)'}</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="understood" 
              checked={understoodConsequences}
              onCheckedChange={(checked) => setUnderstoodConsequences(checked as boolean)}
            />
            <Label htmlFor="understood" className="text-sm">
              I understand the consequences of this action
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleBack} disabled={isLoading}>
            Back
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            disabled={isLoading || !understoodConsequences}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Processing..." : hardDelete ? "Delete Permanently" : "Deactivate Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}