import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Loader2, Shield, ShieldX, Trash2, AlertTriangle } from "lucide-react";
import { AccountAssignmentManager } from "@/components/AccountAssignmentManager";

// Validation schema
const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  accessRole: z.enum(["read", "write"]).optional(),
  location: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface Admin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  activation_status: "pending" | "active" | "suspended";
}

interface EditAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export const EditAdminModal = ({
  open,
  onOpenChange,
  admin,
  accountType,
  onSuccess
}: EditAdminModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [autoAssignAll, setAutoAssignAll] = useState<boolean | null>(null);
  const [currentAccessRole, setCurrentAccessRole] = useState<"read" | "write">("read");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: admin ? `${admin.firstName} ${admin.lastName}` : '',
      email: admin?.email || '',
      phone: admin?.phone || '',
      accessRole: "read",
      location: ''
    }
  });

  // Load current access role for platform admins
  React.useEffect(() => {
    const loadAccessRole = async () => {
      if (admin && accountType === "platform") {
        const { data } = await supabase
          .from('account_users')
          .select('access_role')
          .eq('user_id', admin.id)
          .maybeSingle();
        
        if (data?.access_role) {
          setCurrentAccessRole(data.access_role as "read" | "write");
          form.setValue('accessRole', data.access_role as "read" | "write");
        }
      }
    };
    loadAccessRole();
  }, [admin, accountType]);

  React.useEffect(() => {
    if (admin) {
      form.reset({
        fullName: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        phone: admin.phone || '',
        accessRole: currentAccessRole,
        location: ''
      });
    }
  }, [admin, form, currentAccessRole]);

  const onSubmit = async (values: FormValues) => {
    if (!admin) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: values.fullName,
          first_name: values.fullName.split(' ')[0],
          last_name: values.fullName.split(' ').slice(1).join(' '),
          email: values.email,
          phone: values.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);

      if (error) {
        console.error('Error updating admin:', error);
        toast.error('Failed to update administrator');
        return;
      }

      // Update auto-assign preference if it changed for platform admins
      if (accountType === "platform" && autoAssignAll !== null) {
        const { data: currentData } = await supabase
          .from('users')
          .select('profile_data')
          .eq('id', admin.id)
          .single();

        const updatedProfileData = {
          ...(currentData?.profile_data as any || {}),
          auto_assign_all_accounts: autoAssignAll
        };

        await supabase
          .from('users')
          .update({ profile_data: updatedProfileData })
          .eq('id', admin.id);
      }

      // Update access role for platform admins
      if (accountType === "platform" && values.accessRole) {
        // Get enterprise_id for the platform admin
        const { data: userData } = await supabase
          .from('users')
          .select('enterprise_id')
          .eq('id', admin.id)
          .single();

        if (userData?.enterprise_id) {
          await supabase
            .from('account_users')
            .upsert({
              user_id: admin.id,
              tenant_id: userData.enterprise_id,
              organization_id: null,
              access_role: values.accessRole,
              is_active: true
            }, { 
              onConflict: 'tenant_id,organization_id,user_id' 
            });
        }
      }

      toast.success('Administrator updated successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update administrator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async () => {
    if (!admin) return;
    
    setIsSuspending(true);
    try {
      const newStatus = admin.activation_status === 'suspended' ? 'active' : 'suspended';
      
      const { error } = await supabase
        .from('users')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);

      if (error) {
        console.error('Error updating admin status:', error);
        toast.error(`Failed to ${newStatus === 'suspended' ? 'suspend' : 'unsuspend'} administrator`);
        return;
      }

      toast.success(`Administrator ${newStatus === 'suspended' ? 'suspended' : 'unsuspended'} successfully`);
      onSuccess?.();
      setShowSuspendDialog(false);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error(`Failed to ${admin.activation_status === 'suspended' ? 'unsuspend' : 'suspend'} administrator`);
    } finally {
      setIsSuspending(false);
    }
  };

  const handleDelete = async () => {
    if (!admin) return;
    
    setIsDeleting(true);
    try {
      // Soft delete by setting status to inactive and deactivating roles
      const { error: userError } = await supabase
        .from('users')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);

      if (userError) {
        console.error('Error deleting admin:', userError);
        toast.error('Failed to delete administrator');
        return;
      }

      // Deactivate all roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', admin.id);

      if (roleError) {
        console.error('Error deactivating admin roles:', roleError);
        // Don't return here, user deletion was successful
      }

      toast.success('Administrator deleted successfully');
      onSuccess?.();
      onOpenChange(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete administrator');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTitle = () => {
    switch (accountType) {
      case "platform":
        return "Edit Platform Admin";
      case "enterprise":
        return "Edit Enterprise Admin";
      case "organization":
        return "Edit Organization Admin";
      default:
        return "Edit Admin";
    }
  };

  const getLocationOptions = () => {
    if (accountType === "organization") {
      return [
        "Headquarters",
        "Station 1",
        "Station 2", 
        "Station 3",
        "Field Office",
        "Training Facility"
      ];
    }
    return ["Main Office", "Regional Office", "Branch Office"];
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Edit className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Update administrator information and permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@organization.org" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "platform" && (
              <FormField
                control={form.control}
                name="accessRole"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Access *</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="write" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Write (manage)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="read" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Read (view only)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {accountType !== "platform" && (
              <>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getLocationOptions().map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Separator className="my-6" />
            
            {/* Admin Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Administrator Status</h4>
                  <p className="text-xs text-muted-foreground">
                    {admin.activation_status === 'suspended' 
                      ? 'This administrator is currently suspended and cannot log in' 
                      : 'This administrator can log in and access the platform'
                    }
                  </p>
                </div>
                <Button
                  type="button"
                  variant={admin.activation_status === 'suspended' ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setShowSuspendDialog(true)}
                  disabled={admin.activation_status === 'pending'}
                >
                  {admin.activation_status === 'suspended' ? (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Unsuspend
                    </>
                  ) : (
                    <>
                      <ShieldX className="mr-2 h-4 w-4" />
                      Suspend
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm text-destructive">Delete Administrator</h4>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove this administrator from the system
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Account Assignments for Platform Admins */}
            {accountType === "platform" && admin && (
              <div className="space-y-4">
                <AccountAssignmentManager
                  platformAdminId={admin.id}
                  platformAdminName={`${admin.firstName} ${admin.lastName}`}
                  onAutoAssignChange={setAutoAssignAll}
                />
                <Separator className="my-6" />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Admin'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Suspend/Unsuspend Confirmation Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <AlertDialogTitle>
                  {admin?.activation_status === 'suspended' ? 'Unsuspend Administrator' : 'Suspend Administrator'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {admin?.activation_status === 'suspended' 
                    ? `Are you sure you want to unsuspend ${admin?.firstName} ${admin?.lastName}? They will be able to log in and access the platform again.`
                    : `Are you sure you want to suspend ${admin?.firstName} ${admin?.lastName}? They will not be able to log in until unsuspended.`
                  }
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendToggle}
              disabled={isSuspending}
              className={admin?.activation_status !== 'suspended' ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              {isSuspending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {admin?.activation_status === 'suspended' ? 'Unsuspending...' : 'Suspending...'}
                </>
              ) : (
                admin?.activation_status === 'suspended' ? 'Unsuspend Administrator' : 'Suspend Administrator'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Delete Administrator</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {admin?.firstName} {admin?.lastName}? This action cannot be undone and will permanently remove their access to the system.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Administrator'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};