import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldX, Trash2, Loader2, UserPlus, Edit } from "lucide-react";
import { useUserModal, UserFormData } from "@/hooks/useUserModal";
import { supabase } from "@/integrations/supabase/client";
import { AccountAssignmentManager } from "@/components/AccountAssignmentManager";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  accessRole: z.enum(["read", "write"]).optional(),
  roleTypes: z.object({
    admin: z.boolean(),
    patroller: z.boolean()
  }).optional().refine((data) => {
    if (!data) return true;
    return data.admin || data.patroller;
  }, "At least one role must be selected")
});

interface User {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  activation_status: "pending" | "active" | "disabled" | "deleted";
}

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  accountType: "platform" | "enterprise" | "organization";
  accountId?: string;
  user?: User | null;
  onSuccess?: () => void;
  onSuspendClick?: () => void;
  onDeleteClick?: () => void;
}

export function UserModal({
  open,
  onOpenChange,
  mode,
  accountType,
  accountId,
  user,
  onSuccess,
  onSuspendClick,
  onDeleteClick
}: UserModalProps) {
  const [currentAccessRole, setCurrentAccessRole] = useState<"read" | "write">("read");
  
  const {
    isLoading,
    autoAssignAll,
    setAutoAssignAll,
    handleAdd,
    handleEdit
  } = useUserModal({
    accountType,
    accountId,
    mode,
    userId: user?.user_id
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      accessRole: "read",
      roleTypes: {
        admin: accountType === "organization",
        patroller: false
      }
    }
  });

  // Load current access role for platform admins in edit mode
  useEffect(() => {
    const loadAccessRole = async () => {
      if (user && accountType === "platform" && mode === "edit") {
        const { data } = await supabase
          .from('account_users')
          .select('access_role')
          .eq('user_id', user.user_id)
          .maybeSingle();
        
        if (data?.access_role) {
          setCurrentAccessRole(data.access_role as "read" | "write");
          form.setValue('accessRole', data.access_role as "read" | "write");
        }
      }
    };
    loadAccessRole();
  }, [user, accountType, mode]);

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (mode === "edit" && user) {
      form.reset({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        accessRole: currentAccessRole
      });
    } else if (mode === "add") {
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        accessRole: "read",
        roleTypes: {
          admin: accountType === "organization",
          patroller: false
        }
      });
    }
  }, [user, mode, currentAccessRole, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = mode === "add" 
      ? await handleAdd(values as UserFormData)
      : await handleEdit(values as UserFormData);
    
    if (success) {
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getTitle = () => {
    if (mode === "add") {
      return "Add User";
    }
    
    switch (accountType) {
      case "platform":
        return "Edit Platform Admin";
      case "enterprise":
        return "Edit Enterprise User";
      case "organization":
        return "Edit Organization User";
      default:
        return "Edit User";
    }
  };

  const getDescription = () => {
    if (mode === "add") {
      const type = accountType === "enterprise" ? "enterprise" : "organization";
      return `Add a new user to your ${type}. They will receive an activation email with password setup instructions.`;
    }
    return "Update user information and permissions.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === "edit" ? "sm:max-w-4xl max-h-[90vh] overflow-y-auto" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {mode === "add" ? (
                <UserPlus className="h-4 w-4 text-primary" />
              ) : (
                <Edit className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {getDescription()}
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
                    <Input 
                      placeholder="Enter full name" 
                      className="bg-white" 
                      {...field} 
                    />
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
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      className="bg-white" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "edit" && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="(555) 123-4567" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            {/* Organization: Role Type Selection */}
            {accountType === "organization" && mode === "add" && (
              <FormField
                control={form.control}
                name="roleTypes"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Role Type *</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="admin-role"
                          checked={field.value?.admin ?? false}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            admin: e.target.checked
                          })}
                          className="mt-1 h-4 w-4 rounded border-input"
                        />
                        <label
                          htmlFor="admin-role"
                          className="text-sm leading-tight cursor-pointer"
                        >
                          <div className="font-medium">Organization Admin</div>
                          <div className="text-muted-foreground">Can manage users, settings, and all data</div>
                        </label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="patroller-role"
                          checked={field.value?.patroller ?? false}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            patroller: e.target.checked
                          })}
                          className="mt-1 h-4 w-4 rounded border-input"
                        />
                        <label
                          htmlFor="patroller-role"
                          className="text-sm leading-tight cursor-pointer"
                        >
                          <div className="font-medium">Patroller</div>
                          <div className="text-muted-foreground">Can submit reports and view assigned data</div>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Users with both roles will choose their view when logging in
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Edit Mode Only: Admin Actions */}
            {mode === "edit" && user && (
              <>
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">User Status</h4>
                      <p className="text-xs text-muted-foreground">
                        {user.activation_status === 'disabled' 
                          ? 'This user is currently disabled and cannot log in' 
                          : 'This user can log in and access the platform'
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={user.activation_status === 'disabled' ? "default" : "secondary"}
                      size="sm"
                      onClick={onSuspendClick}
                      disabled={user.activation_status === 'pending'}
                    >
                      {user.activation_status === 'disabled' ? (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Enable
                        </>
                      ) : (
                        <>
                          <ShieldX className="mr-2 h-4 w-4" />
                          Disable
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-destructive">Delete User</h4>
                      <p className="text-xs text-muted-foreground">
                        Permanently remove this user from the system
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={onDeleteClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Edit Mode Only: Account Assignments for Platform Admins */}
            {mode === "edit" && accountType === "platform" && user && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <AccountAssignmentManager
                    platformAdminId={user.user_id}
                    platformAdminName={`${user.firstName} ${user.lastName}`}
                    onAutoAssignChange={setAutoAssignAll}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  mode === "add" ? "Add User" : "Update User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
