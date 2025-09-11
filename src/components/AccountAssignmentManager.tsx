import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, X, Building2, Users, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlatformAdminAssignmentManager, type Account, type AccountAssignment } from '@/hooks/usePlatformAdminAssignments';

interface AccountAssignmentManagerProps {
  platformAdminId: string;
  platformAdminName: string;
}

export const AccountAssignmentManager = ({ 
  platformAdminId, 
  platformAdminName 
}: AccountAssignmentManagerProps) => {
  const {
    assignments,
    availableAccounts,
    isLoading,
    addAssignment,
    removeAssignment
  } = usePlatformAdminAssignmentManager(platformAdminId);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<AccountAssignment | null>(null);
  const [autoAssignAll, setAutoAssignAll] = useState(false);
  const [isAssigningAll, setIsAssigningAll] = useState(false);
  const { toast } = useToast();

  // Load auto-assign preference when component mounts
  useEffect(() => {
    const loadAutoAssignPreference = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('profile_data')
          .eq('id', platformAdminId)
          .single();

        if (error) {
          console.error('Error loading auto-assign preference:', error);
          return;
        }

        const autoAssign = (data?.profile_data as any)?.auto_assign_all_accounts === true;
        setAutoAssignAll(autoAssign);
      } catch (error) {
        console.error('Error loading auto-assign preference:', error);
      }
    };

    if (platformAdminId) {
      loadAutoAssignPreference();
    }
  }, [platformAdminId]);

  // Auto-assign new accounts if preference is enabled
  useEffect(() => {
    const autoAssignNewAccounts = async () => {
      if (!autoAssignAll || isLoading || unassignedAccounts.length === 0) return;

      try {
        for (const account of unassignedAccounts) {
          await addAssignment(platformAdminId, account.id, account.type);
        }
      } catch (error) {
        console.error('Error auto-assigning new accounts:', error);
      }
    };

    autoAssignNewAccounts();
  }, [availableAccounts, autoAssignAll, isLoading]); // Trigger when new accounts are available

  // Filter out already assigned accounts
  const assignedAccountIds = assignments.map(a => a.account_id);
  const unassignedAccounts = availableAccounts.filter(account => !assignedAccountIds.includes(account.id));

  const handleAddAssignment = async () => {
    if (!selectedAccountId) return;

    const selectedAccount = availableAccounts.find(a => a.id === selectedAccountId);
    if (!selectedAccount) return;

    setIsAdding(true);
    const success = await addAssignment(platformAdminId, selectedAccountId, selectedAccount.type);
    if (success) {
      setSelectedAccountId('');
    }
    setIsAdding(false);
  };

  const handleRemoveClick = (assignment: AccountAssignment) => {
    setAssignmentToRemove(assignment);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!assignmentToRemove) return;

    await removeAssignment(assignmentToRemove.id, platformAdminId);
    setRemoveDialogOpen(false);
    setAssignmentToRemove(null);
  };

  const handleSelectAllAccounts = async (checked: boolean) => {
    setAutoAssignAll(checked);
    
    try {
      // Update the admin's auto-assign preference in the database
      const currentProfileData = await supabase
        .from('users')
        .select('profile_data')
        .eq('id', platformAdminId)
        .single();

      const updatedProfileData = {
        ...(currentProfileData.data?.profile_data as any || {}),
        auto_assign_all_accounts: checked
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_data: updatedProfileData
        })
        .eq('id', platformAdminId);

      if (updateError) {
        console.error('Error updating auto-assign preference:', updateError);
        toast({
          title: "Error",
          description: "Failed to save auto-assign preference.",
          variant: "destructive"
        });
        return;
      }

      if (checked) {
        // Assign all unassigned accounts
        setIsAssigningAll(true);
        for (const account of unassignedAccounts) {
          await addAssignment(platformAdminId, account.id, account.type);
        }
        setIsAssigningAll(false);
        
        toast({
          title: "Auto-Assignment Enabled",
          description: "All current and future accounts will be assigned to this admin."
        });
      } else {
        toast({
          title: "Auto-Assignment Disabled",
          description: "Manual account assignment is now required."
        });
      }
    } catch (error) {
      console.error('Error handling select all accounts:', error);
      setIsAssigningAll(false);
      toast({
        title: "Error",
        description: "Failed to update account assignments.",
        variant: "destructive"
      });
    }
  };

  const getAccountIcon = (type: string) => {
    return type === 'Enterprise' ? Building2 : Users;
  };

  const getAccountTypeLabel = (type: string) => {
    return type === 'Enterprise' ? 'Enterprise' : 'Organization';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account Assignments</CardTitle>
        <CardDescription>
          Manage which accounts {platformAdminName} can oversee
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select All Accounts Option */}
        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
          <Checkbox
            id="auto-assign-all"
            checked={autoAssignAll}
            onCheckedChange={handleSelectAllAccounts}
            disabled={isLoading || isAssigningAll}
          />
          <div className="flex items-center gap-2 flex-1">
            <CheckSquare className="h-4 w-4 text-primary" />
            <div>
              <label htmlFor="auto-assign-all" className="text-sm font-medium cursor-pointer">
                Assign All Accounts
              </label>
              <p className="text-xs text-muted-foreground">
                {autoAssignAll 
                  ? "This admin can oversee all accounts. New accounts will be auto-assigned." 
                  : "Enable to assign all current and future accounts to this admin."
                }
              </p>
            </div>
          </div>
          {isAssigningAll && (
            <div className="text-xs text-muted-foreground">Assigning...</div>
          )}
        </div>

        {/* Add New Assignment */}
        <div className="flex gap-2">
          <Select 
            value={selectedAccountId} 
            onValueChange={setSelectedAccountId}
            disabled={isLoading || unassignedAccounts.length === 0 || autoAssignAll}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an account to assign" />
            </SelectTrigger>
            <SelectContent>
              {unassignedAccounts.map((account) => {
                const Icon = getAccountIcon(account.type);
                return (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{account.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddAssignment}
            disabled={!selectedAccountId || isAdding || isLoading || autoAssignAll}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Assign'}
          </Button>
        </div>

        {unassignedAccounts.length === 0 && !isLoading && !autoAssignAll && (
          <p className="text-sm text-muted-foreground text-center py-2">
            All available accounts are already assigned
          </p>
        )}

        {autoAssignAll && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Individual assignment disabled - all accounts are auto-assigned
          </p>
        )}

        {/* Current Assignments */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Assignments ({assignments.length})</h4>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No accounts assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => {
                const Icon = getAccountIcon(assignment.account_type);
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{assignment.account_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getAccountTypeLabel(assignment.account_type)} • Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveClick(assignment)}
                      disabled={autoAssignAll}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Remove Assignment Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the assignment for "{assignmentToRemove?.account_name}"? 
              {platformAdminName} will no longer have oversight access to this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemove}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};