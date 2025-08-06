"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the form schema with Zod
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["ADMIN", "SUBMITTER"]),
  approverId: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  disableNameEmail?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  title: string;
  description: string;
  submitButtonText: string;
  defaultValues?: Partial<UserFormValues>;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitButtonText,
  defaultValues = {
    name: "",
    email: "",
    role: "SUBMITTER",
    approverId: "",
  },
  disableNameEmail = false,
}: UserFormDialogProps) {
  const [adminUsers, setAdminUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch admin users for the dropdown
  useEffect(() => {
    const fetchAdminUsers = async () => {
      setIsLoadingAdmins(true);
      try {
        const response = await fetch("/api/admin/users/admins");
        if (!response.ok) {
          throw new Error("Failed to fetch admin users");
        }
        const data = await response.json();
        setAdminUsers(data.data || []);
      } catch (error) {
        console.error("Error fetching admin users:", error);
      } finally {
        setIsLoadingAdmins(false);
      }
    };

    if (open) {
      fetchAdminUsers();
    }
  }, [open]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: UserFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  const watchRole = form.watch("role");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={disableNameEmail} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} disabled={disableNameEmail} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUBMITTER">Submitter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchRole === "SUBMITTER" && (
              <FormField
                control={form.control}
                name="approverId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Submits to</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        console.log("Selected approver ID:", value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an approver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingAdmins ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : adminUsers.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No admin users found
                          </SelectItem>
                        ) : (
                          adminUsers.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name} ({admin.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Person who will approve this user's submissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader size="sm" /> : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
