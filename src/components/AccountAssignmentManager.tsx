import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, X, Building2, Users } from 'lucide-react';
import { usePlatformAdminAssignments, type Account, type AccountAssignment } from '@/hooks/usePlatformAdminAssignments';

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
  } = usePlatformAdminAssignments(platformAdminId);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<AccountAssignment | null>(null);

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

  const getAccountIcon = (type: string) => {
    return type === 'enterprise' ? Building2 : Users;
  };

  const getAccountTypeLabel = (type: string) => {
    return type === 'enterprise' ? 'Enterprise' : 'Organization';
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
        {/* Add New Assignment */}
        <div className="flex gap-2">
          <Select 
            value={selectedAccountId} 
            onValueChange={setSelectedAccountId}
            disabled={isLoading || unassignedAccounts.length === 0}
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
            disabled={!selectedAccountId || isAdding || isLoading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Assign'}
          </Button>
        </div>

        {unassignedAccounts.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-2">
            All available accounts are already assigned
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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