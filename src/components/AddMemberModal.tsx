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
  role: z.enum(["write", "read", "patroller"], {
    required_error: "Please select an access role"
  }),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  radioCallSign: z.string().min(1, "Radio call sign is required"),
  specialization: z.enum(["Medical", "Water Rescue", "Climbing", "Navigation"], {
    required_error: "Please select a specialization"
  }),
  certifications: z.array(z.string()).min(1, "At least one certification is required")
});
interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AddMemberModal({
  open,
  onOpenChange
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
      role: "read",
      email: "",
      phone: "",
      radioCallSign: "",
      certifications: []
    }
  });
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
      if (!currentUser?.organization_id) {
        throw new Error('No organization found');
      }
      const roleMap: {
        [key: string]: string;
      } = {
        write: 'User',
        read: 'User',
        patroller: 'Patroller'
      };
      const result = await createUser({
        email: values.email,
        fullName: values.fullName,
        role: roleMap[values.role],
        accessRole: values.role === 'patroller' ? undefined : values.role as 'read' | 'write',
        tenantId: currentUser.tenant_id,
        organizationId: currentUser.organization_id,
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
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your team directory. Fill in all required information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="fullName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="role" render={({
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
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="patroller" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Patroller
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="radioCallSign" render={({
            field
          }) => <FormItem>
                  <FormLabel>Radio Call Sign *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter radio call sign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="specialization" render={({
            field
          }) => {}} />

            <FormField control={form.control} name="certifications" render={() => {}} />

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