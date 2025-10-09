import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  accessLevel: z.enum(["write", "read"], {
    required_error: "Please select an access level"
  }),
  isPatroller: z.boolean().default(false),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  radioCallSign: z.string().optional(),
  specialization: z.enum(["Medical", "Water Rescue", "Climbing", "Navigation"], {
    required_error: "Please select a specialization"
  }).optional(),
  certifications: z.array(z.string()).optional()
});
interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}
export function AddMemberModal({
  open,
  onOpenChange,
  organizationId
}: AddMemberModalProps) {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    createUser
  } = useUserManagement();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      accessLevel: "read",
      isPatroller: false,
      email: "",
      phone: "",
      radioCallSign: "",
      certifications: []
    }
  });

  const isPatroller = form.watch("isPatroller");
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Get current user's organization info for database insert
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const {
        data: currentUser
      } = await supabase.from('users').select('organization_id, tenant_id').eq('auth_user_id', user.id).single();
      
      // Use provided organizationId (from URL) or fall back to current user's organization
      const targetOrgId = organizationId || currentUser?.organization_id;
      
      if (!targetOrgId) {
        throw new Error('No organization found');
      }
      
      // Always fetch the organization's tenant_id to ensure correct mapping
      const { data: org } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', targetOrgId)
        .single();
      
      // For standalone organizations (tenant_id is null), use organization_id as tenant_id
      // For organizations under an enterprise, use the organization's tenant_id
      const tenantId = org?.tenant_id || targetOrgId;
      const result = await createUser({
        email: values.email,
        fullName: values.fullName,
        role: values.isPatroller ? 'Patroller' : 'User',
        accessRole: values.accessLevel,
        isPatroller: values.isPatroller,
        tenantId: tenantId!,
        organizationId: targetOrgId,
        phone: values.phone
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }
      toast({
        title: "Member Added",
        description: `${values.fullName} has been added to the team.`
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const certificationOptions = [{
    id: "first-aid",
    label: "First Aid"
  }, {
    id: "cpr",
    label: "CPR"
  }];
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Add a new user to your organization. They will receive an activation email with password setup instructions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="fullName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" className="bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" className="bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="accessLevel" render={({
            field
          }) => <FormItem className="space-y-3">
                  <FormLabel>Access *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
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
                </FormItem>} />

            <FormField control={form.control} name="isPatroller" render={({
            field
          }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal cursor-pointer">
                      Patroller
                    </FormLabel>
                  </div>
                </FormItem>} />

            {isPatroller && (
              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            )}

            {isPatroller && (
              <FormField control={form.control} name="radioCallSign" render={({
              field
            }) => <FormItem>
                    <FormLabel>Radio Call Sign</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter radio call sign" className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
}