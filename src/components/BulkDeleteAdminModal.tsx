import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Users, Trash2 } from "lucide-react";

interface Admin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  activation_status?: string;
}

interface BulkDeleteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins: Admin[];
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export function BulkDeleteAdminModal({
  open,
  onOpenChange,
  admins,
  accountType,
  onSuccess
}: BulkDeleteAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'details' | 'final' | 'progress'>('confirm');
  const [confirmationText, setConfirmationText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [hardDelete, setHardDelete] = useState(false);
  const [understoodConsequences, setUnderstoodConsequences] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [results, setResults] = useState<{success: number, failed: number}>({success: 0, failed: 0});

  const resetModal = () => {
    setStep('confirm');
    setConfirmationText('');
    setDeletionReason('');
    setHardDelete(false);
    setUnderstoodConsequences(false);
    setProgress(0);
    setCurrentAdmin('');
    setResults({success: 0, failed: 0});
  };

  const expectedConfirmText = `DELETE ${admins.length} ADMINS`;
  const isConfirmationValid = confirmationText.trim() === expectedConfirmText;

  const handleBulkDelete = async () => {
    if (!isConfirmationValid || !understoodConsequences) return;
    
    setIsLoading(true);
    setStep('progress');
    
    let successCount = 0;
    let failedCount = 0;
    
    try {
      for (let i = 0; i < admins.length; i++) {
        const admin = admins[i];
        setCurrentAdmin(`${admin.firstName} ${admin.lastName}`);
        setProgress(((i + 1) / admins.length) * 100);
        
        try {
          const { data, error } = await supabase.rpc('delete_admin_with_audit', {
            p_admin_id: admin.id,
            p_deletion_reason: deletionReason || 'Bulk administrative action',
            p_hard_delete: hardDelete
          });

          const result = data as { success: boolean; error?: string; message?: string };
          if (error || !result.success) {
            console.error(`Error deleting admin ${admin.email}:`, error || result.error);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error deleting admin ${admin.email}:`, error);
          failedCount++;
        }
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setResults({success: successCount, failed: failedCount});
      
      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} administrator${successCount > 1 ? 's' : ''}`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to process ${failedCount} administrator${failedCount > 1 ? 's' : ''}`);
      }
      
      setTimeout(() => {
        resetModal();
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Bulk deletion failed');
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
    if (!isLoading) {
      resetModal();
      onOpenChange(false);
    }
  };

  const getTitle = () => {
    const stepTitle = step === 'confirm' ? 'Confirm Bulk Deletion' :
                    step === 'details' ? 'Bulk Deletion Details' :
                    step === 'final' ? 'Final Confirmation' : 'Processing Deletions';
    return `${stepTitle} - ${admins.length} Administrators`;
  };

  if (admins.length === 0) return null;

  // Progress step
  if (step === 'progress') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Processing Deletions
            </DialogTitle>
            <DialogDescription>
              Please wait while we process the administrator deletions...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
            
            {currentAdmin && (
              <div className="text-sm text-muted-foreground">
                Currently processing: <strong>{currentAdmin}</strong>
              </div>
            )}
            
            {results.success > 0 || results.failed > 0 ? (
              <div className="space-y-1 text-sm">
                <div className="text-green-600">✓ Successful: {results.success}</div>
                {results.failed > 0 && (
                  <div className="text-red-600">✗ Failed: {results.failed}</div>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 1: Initial confirmation
  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {getTitle()}
            </DialogTitle>
            <DialogDescription>
              You are about to delete multiple administrator accounts. Please review and confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> You are about to delete {admins.length} administrator account{admins.length > 1 ? 's' : ''}. This is a sensitive operation.
              </AlertDescription>
            </Alert>

            <div className="max-h-40 overflow-y-auto space-y-2 bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium text-sm">Administrators to be deleted:</h4>
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium">{admin.firstName} {admin.lastName}</span>
                    <span className="text-muted-foreground ml-2">({admin.email})</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{admin.role}</Badge>
                </div>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                To proceed, please type: <strong>{expectedConfirmText}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type confirmation text</Label>
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
              <Users className="h-5 w-5" />
              {getTitle()}
            </DialogTitle>
            <DialogDescription>
              Provide details about this bulk deletion for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for bulk deletion *</Label>
              <Textarea
                id="reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Please explain why these administrators are being deleted..."
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
                  Permanent deletion for all administrators
                </Label>
              </div>
              
              {!hardDelete && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Soft deletion will deactivate all accounts but preserve data for audit purposes.
                  </AlertDescription>
                </Alert>
              )}
              
              {hardDelete && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Warning:</strong> Permanent deletion will completely remove all data for {admins.length} administrators. This action cannot be undone.
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
            Final Bulk Deletion Confirmation
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to {hardDelete ? 'permanently delete' : 'deactivate'} <strong>{admins.length} administrator account{admins.length > 1 ? 's' : ''}</strong>.
            
            <div className="mt-3 p-3 bg-muted rounded-lg text-sm space-y-1">
              <div><strong>Action:</strong> {hardDelete ? 'Permanent Deletion' : 'Account Deactivation'}</div>
              <div><strong>Count:</strong> {admins.length} administrators</div>
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
              I understand this will affect {admins.length} administrator account{admins.length > 1 ? 's' : ''} and the consequences of this action
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleBack} disabled={isLoading}>
            Back
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBulkDelete}
            disabled={isLoading || !understoodConsequences}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Processing..." : hardDelete ? `Delete ${admins.length} Permanently` : `Deactivate ${admins.length} Accounts`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}