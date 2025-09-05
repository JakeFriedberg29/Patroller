import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useParams } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().optional(),
  location: z.string().optional(),
});

interface AddAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export function AddAdminModal({ 
  open, 
  onOpenChange, 
  accountType,
  onSuccess 
}: AddAdminModalProps) {
  const { id: accountId } = useParams();
  const { createUser, isLoading } = useUserManagement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
      location: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const roleTitle = accountType === "platform" ? "Platform Admin" : 
                     accountType === "enterprise" ? "Enterprise Admin" : "Organization Admin";
    
    // Log admin creation attempt
    try {
      await supabase.rpc('log_user_action', {
        p_action: 'CREATE_ATTEMPT',
        p_resource_type: accountType + '_admin',
        p_resource_id: null,
        p_metadata: {
          target_email: values.email,
          target_name: values.fullName,
          target_department: values.department,
          target_location: values.location,
          action_context: accountType + '_admin_creation'
        }
      });
    } catch (logError) {
      console.warn('Failed to log admin creation attempt:', logError);
    }

    const result = await createUser({
      email: values.email,
      fullName: values.fullName,
      role: roleTitle,
      tenantId: accountId,
      organizationId: accountType === "organization" ? accountId : undefined,
      department: values.department,
      location: values.location,
    });

    if (result.success) {
      // Log successful admin creation with detailed information
      try {
        await supabase.rpc('log_user_action', {
          p_action: 'CREATE',
          p_resource_type: 'user',
          p_resource_id: result.userId || null,
          p_new_values: {
            email: values.email,
            full_name: values.fullName,
            role_type: roleTitle,
            department: values.department,
            location: values.location,
            status: 'pending'
          },
          p_metadata: {
            target_admin_name: values.fullName,
            target_admin_email: values.email,
            target_admin_role: roleTitle,
            account_type: accountType,
            setup_method: 'admin_invitation',
            action_description: `Created new admin '${values.fullName} (${values.email})' with role '${roleTitle}'`
          }
        });
      } catch (logError) {
        console.warn('Failed to log successful admin creation:', logError);
      }

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getTitle = () => {
    switch (accountType) {
      case "platform":
        return "Add Platform Admin";
      case "enterprise":
        return "Add Enterprise Admin";
      case "organization":
        return "Add Organization Admin";
      default:
        return "Add Admin";
    }
  };

  const getDescription = () => {
    switch (accountType) {
      case "platform":
        return "Add a new platform administrator with system-wide access. They will receive an activation email with password setup instructions.";
      case "enterprise":
        return "Add a new administrator to your enterprise. They will receive an activation email with password setup instructions.";
      case "organization":
        return "Add a new administrator to your organization. They will receive an activation email with password setup instructions.";
      default:
        return "Add a new administrator. They will receive an activation email with password setup instructions.";
    }
  };

  const getDepartmentOptions = () => {
    switch (accountType) {
      case "platform":
        return [
          "Platform Operations",
          "System Administration", 
          "Security & Compliance",
          "Technical Support",
          "Business Development",
          "Legal & Compliance"
        ];
      case "enterprise":
        return [
          "Operations",
          "Logistics", 
          "Research & Development",
          "Energy Division",
          "Healthcare",
          "Finance",
          "Human Resources",
          "Legal",
          "Information Technology"
        ];
      case "organization":
        return [
          "Operations",
          "Training",
          "Equipment",
          "Communications", 
          "Medical",
          "Search & Rescue",
          "Emergency Services",
          "Administration"
        ];
      default:
        return ["Operations", "Administration"];
    }
  };

  const getLocationOptions = () => {
    return [
      "Headquarters",
      "Field Office - North",
      "Field Office - South", 
      "Field Office - East",
      "Field Office - West",
      "Mobile Unit",
      "Remote"
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
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
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department {accountType !== "platform" && "*"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getDepartmentOptions().map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location {accountType !== "platform" && "*"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getLocationOptions().map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Account Creation Process</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Admin will receive an activation email with temporary login credentials</p>
                <p>• They must click the activation link to confirm their account</p>
                <p>• Temporary password will be shown in the activation email</p>
                <p>• Admin can log in immediately after activation</p>
                <p>• Account activation link expires in 24 hours</p>
              </div>
            </div>

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
                {isLoading ? "Creating..." : `Add ${
                  accountType === "platform" ? "Platform" : 
                  accountType === "enterprise" ? "Enterprise" : "Organization"
                } Admin`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}