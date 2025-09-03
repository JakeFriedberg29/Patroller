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
import { useUserManagement } from "@/hooks/useUserManagement";
import { useParams } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
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
      department: "",
      location: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const roleTitle = accountType === "enterprise" ? "Enterprise Admin" : "Organization Admin";
    
    const result = await createUser({
      email: values.email,
      fullName: values.fullName,
      role: roleTitle,
      accountId: accountId,
      accountType: accountType,
    });

    if (result.success) {
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getTitle = () => {
    return accountType === "enterprise" ? "Add Enterprise Admin" : "Add Organization Admin";
  };

  const getDescription = () => {
    const type = accountType === "enterprise" ? "enterprise" : "organization";
    return `Add a new administrator to your ${type}. They will receive an activation email with password setup instructions.`;
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
    } else {
      // Organization departments vary by organization type
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
                  <FormLabel>Department *</FormLabel>
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
                  <FormLabel>Location *</FormLabel>
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
              <h4 className="font-medium text-sm">Account Activation Process</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Admin will receive an activation email with secure signup link</p>
                <p>• Password must meet security requirements (12+ chars, mixed case, numbers, symbols)</p>
                <p>• Account activation link expires in 24 hours</p>
                <p>• Admin must change password every 12 months</p>
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
                {isLoading ? "Creating..." : `Add ${accountType === "enterprise" ? "Enterprise" : "Organization"} Admin`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}