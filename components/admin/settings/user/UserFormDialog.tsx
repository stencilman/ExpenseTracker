"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

// Define the form schema with Zod
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["ADMIN", "SUBMITTER"]),
  approverId: z.string().optional(),
  employeeId: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  dateOfJoining: z.date().optional().nullable(),
  dateOfBirth: z.date().optional().nullable(),
  designation: z.string().optional().nullable(),
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
  shouldDisableSubmit?: (formData: UserFormValues) => boolean;
  isSubmitting?: boolean;
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
    employeeId: "",
    mobile: "",
    department: "",
    designation: "",
    dateOfJoining: undefined,
    dateOfBirth: undefined,
  },
  disableNameEmail = false,
  shouldDisableSubmit,
  isSubmitting = false,
}: UserFormDialogProps) {
  const [adminUsers, setAdminUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch admin users for the dropdown
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        console.log("Fetching admin users for dropdown");
        setIsLoadingAdmins(true);
        // Use the specific admin users endpoint
        const response = await fetch("/api/admin/users/admins");
        if (!response.ok) {
          throw new Error("Failed to fetch admin users");
        }
        const result = await response.json();
        console.log("Admin users API response:", result);
        
        // Check if data is in the expected format
        const adminData = Array.isArray(result) ? result : result.data || [];

        if (Array.isArray(adminData)) {
          const formattedAdmins = adminData.map((admin: any) => ({
            id: admin.id,
            name: admin.name || `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
            email: admin.email,
          }));
          
          console.log("Formatted admin users for dropdown:", formattedAdmins);
          setAdminUsers(formattedAdmins);
        } else {
          console.error("Unexpected data format for admin users:", result);
          setAdminUsers([]);
        }
      } catch (error) {
        console.error("Error fetching admin users:", error);
      } finally {
        setIsLoadingAdmins(false);
      }
    };

    fetchAdminUsers();
  }, []);

  // Initialize form with defaultValues
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });
  
  // Reset form when defaultValues change or when dialog opens
  useEffect(() => {
    if (defaultValues && open) {
      console.log("Resetting form with defaultValues:", defaultValues);
      // Reset the form with defaultValues and mark it as pristine (not dirty)
      form.reset(defaultValues, {
        keepValues: true,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });
      
      console.log("Form dirty state after reset:", form.formState.isDirty);
    }
  }, [defaultValues, form, open]);

  // Handle form submission
  const handleSubmit = async (data: UserFormValues) => {
    console.log("Form submitted with data:", data);
    try {
      console.log("Calling onSubmit with data:", data);
      await onSubmit(data);
      console.log("onSubmit completed successfully");
      
      // Reset the form with the current values and mark it as pristine
      form.reset(data, {
        keepValues: true,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  const watchRole = form.watch("role");

  // Log when isSubmitting prop changes
  useEffect(() => {
    console.log("UserFormDialog received isSubmitting:", isSubmitting);
  }, [isSubmitting]);

  // Function to check if form values have actually changed from defaultValues
  const hasActualChanges = () => {
    const currentValues = form.getValues();
    
    // Helper function to compare values, handling dates specially
    const isDifferent = (a: any, b: any) => {
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() !== b.getTime();
      }
      if (a instanceof Date && typeof b === 'string') {
        return a.toISOString() !== b;
      }
      if (typeof a === 'string' && b instanceof Date) {
        return a !== b.toISOString();
      }
      if (a === null || a === undefined) return b !== null && b !== undefined;
      if (b === null || b === undefined) return true;
      return a !== b;
    };
    
    // Check each field for changes
    return Object.keys(currentValues).some(key => {
      const fieldName = key as keyof UserFormValues;
      const hasChanged = isDifferent(currentValues[fieldName], defaultValues[fieldName]);
      if (hasChanged) {
        console.log(`Field ${fieldName} changed:`, { 
          current: currentValues[fieldName], 
          default: defaultValues[fieldName] 
        });
      }
      return hasChanged;
    });
  };
  
  // Log when form dirty state changes
  useEffect(() => {
    const isDirty = form.formState.isDirty;
    const actualChanges = hasActualChanges();
    console.log("Form dirty state changed:", isDirty, "Actual changes:", actualChanges);
    console.log("Dirty fields:", form.formState.dirtyFields);
  }, [form.formState.isDirty, form.formState.dirtyFields]);

  // Log form state changes
  useEffect(() => {
    const subscription = form.watch(() => {
      console.log("Form state:", {
        isDirty: form.formState.isDirty,
        dirtyFields: form.formState.dirtyFields,
        isValid: form.formState.isValid,
        currentValues: form.getValues()
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto px-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("Form onSubmit event triggered");
              form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4 [&_.form-item]:space-y-1 [&_.form-label]:text-sm [&_input]:h-8 [&_button]:h-8 [&_.select-trigger]:h-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left column */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={disableNameEmail}
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
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe@example.com"
                          {...field}
                          disabled={disableNameEmail}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Employee ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Employee ID"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Mobile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mobile number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Department</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Department"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="dateOfJoining"
                  render={({ field }) => (
                    <FormItem className="form-item flex flex-col">
                      <FormLabel className="form-label">
                        Date of Joining
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            startMonth={new Date(1900, 0)}
                            endMonth={new Date(new Date().getFullYear(), 11)}
                            selected={field.value ?? undefined}
                            onSelect={(date) =>
                              field.onChange(date || undefined)
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="form-item flex flex-col">
                      <FormLabel className="form-label">
                        Date of Birth
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            startMonth={new Date(1900, 0)}
                            endMonth={new Date(new Date().getFullYear(), 11)}
                            selected={field.value ?? undefined}
                            onSelect={(date) =>
                              field.onChange(date || undefined)
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Designation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Designation"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="form-label">Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="select-trigger">
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
                      <FormItem className="form-item flex flex-col">
                        <FormLabel className="form-label">Submits to</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            console.log("Selected approver ID:", value);
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="select-trigger">
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
                              adminUsers
                                .filter(admin => admin.id && admin.name && admin.email) // Ensure we have valid data
                                .map((admin) => (
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
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  console.log("Manual submit button clicked, isSubmitting:", isSubmitting);
                  const actualChanges = hasActualChanges();
                  console.log("Form has actual changes:", actualChanges);
                  console.log("Form is dirty:", form.formState.isDirty);
                  const formData = form.getValues();
                  console.log("Form data to submit:", formData);
                  handleSubmit(formData);
                }}
                disabled={isSubmitting || !hasActualChanges()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" className="text-white" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  submitButtonText
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
