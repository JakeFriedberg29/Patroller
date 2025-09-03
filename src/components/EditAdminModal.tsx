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
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
});

interface Admin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  location?: string;
  role: string;
  activation_status: string;
}

interface EditAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  accountType: "platform" | "enterprise" | "organization";
  onSuccess?: () => void;
}

export function EditAdminModal({ 
  open, 
  onOpenChange, 
  admin,
  accountType,
  onSuccess 
}: EditAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: admin ? `${admin.firstName} ${admin.lastName}` : "",
      email: admin?.email || "",
      phone: admin?.phone || "",
      department: admin?.department || "",
      location: admin?.location || "",
    },
  });

  // Update form when admin changes
  useState(() => {
    if (admin) {
      form.reset({
        fullName: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        phone: admin.phone || "",
        department: admin.department || "",
        location: admin.location || "",
      });
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!admin) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone || null,
          department: values.department || null,
          location: values.location || null,
        })
        .eq('id', admin.id);

      if (error) {
        console.error('Error updating admin:', error);
        toast.error('Failed to update administrator');
        return;
      }

      toast.success('Administrator updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update administrator');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (accountType) {
      case "platform": return "Edit Platform Admin";
      case "enterprise": return "Edit Enterprise Admin";
      case "organization": return "Edit Organization Admin";
      default: return "Edit Admin";
    }
  };

  const getDepartmentOptions = () => {
    if (accountType === "enterprise") {
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
    } else if (accountType === "organization") {
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
    }
    return [];
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

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Update administrator information and details.
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
                      <FormLabel>Location</FormLabel>
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
                {isLoading ? "Updating..." : "Update Admin"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}