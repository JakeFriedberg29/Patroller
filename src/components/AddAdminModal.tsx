import { } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  accessRole: z.enum(["read","write"]).default("read"),
});

interface AddAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountType: "enterprise" | "organization";
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
      accessRole: "read",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    // Resolve tenant id correctly when creating users for an organization
    let tenantIdToUse: string | undefined = accountId;
    if (accountType === "organization" && accountId) {
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', accountId)
        .single();
      if (orgErr) {
        console.error('Failed to load organization tenant_id:', orgErr);
      }
      tenantIdToUse = org?.tenant_id || undefined;
    }

    const result = await createUser({
      email: values.email,
      fullName: values.fullName,
      role: 'User',
      accessRole: values.accessRole,
      tenantId: tenantIdToUse,
      organizationId: accountType === "organization" ? accountId : undefined,
    });

    if (result.success) {
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getTitle = () => {
    return "Add User";
  };

  const getDescription = () => {
    const type = accountType === "enterprise" ? "enterprise" : "organization";
    return `Add a new user to your ${type}. They will receive an activation email with password setup instructions.`;
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

            

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Account Creation Process</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• User will receive an activation email with temporary login credentials</p>
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
                {isLoading ? "Creating..." : `Add ${accountType === "enterprise" ? "Enterprise" : "Organization"} User`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}