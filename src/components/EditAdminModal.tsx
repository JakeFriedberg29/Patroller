import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";

// Validation schema
const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: admin ? `${admin.firstName} ${admin.lastName}` : '',
      email: admin?.email || '',
      phone: admin?.phone || '',
      department: '',
      location: ''
    }
  });

  React.useEffect(() => {
    if (admin) {
      form.reset({
        fullName: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        phone: admin.phone || '',
        department: '',
        location: ''
      });
    }
  }, [admin, form]);

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

  const getDepartmentOptions = () => {
    if (accountType === "organization") {
      return [
        "Operations",
        "Safety",
        "Training",
        "Medical",
        "Communications",
        "Logistics"
      ];
    }
    return ["Administration", "Operations", "Technical", "Support"];
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
      <DialogContent className="sm:max-w-md">
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

            {accountType !== "platform" && (
              <>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getDepartmentOptions().map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
    </Dialog>
  );
};