"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  Calendar as CalendarIcon,
  Phone,
  Building,
  CalendarDays,
  Award,
  Save,
  Pencil,
  X,
  LogOut,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import SignoutButton from "@/components/auth/signout-button";
import {
  UserSettingsSchema,
  UserSettingsFormValues,
  ROLE_NAMES,
} from "@/lib/validations/user";
import { toast } from "sonner";

export default function MePage() {
  const currentUser = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [originalValues, setOriginalValues] =
    useState<UserSettingsFormValues | null>(null);

  // State to track if form has changes
  const [hasChanges, setHasChanges] = useState(false);

  // Function to check if form has actual changes
  const hasFormChanges = () => {
    if (!originalValues) return false;

    const currentValues = form.getValues();
    console.log("Checking form changes:", { currentValues, originalValues });

    // Compare each field
    if (currentValues.firstName !== originalValues.firstName) {
      console.log(
        "firstName changed:",
        currentValues.firstName,
        originalValues.firstName
      );
      return true;
    }
    if (currentValues.lastName !== originalValues.lastName) {
      console.log(
        "lastName changed:",
        currentValues.lastName,
        originalValues.lastName
      );
      return true;
    }
    if (currentValues.employeeId !== originalValues.employeeId) {
      console.log(
        "employeeId changed:",
        currentValues.employeeId,
        originalValues.employeeId
      );
      return true;
    }
    if (currentValues.mobile !== originalValues.mobile) {
      console.log(
        "mobile changed:",
        currentValues.mobile,
        originalValues.mobile
      );
      return true;
    }
    if (currentValues.department !== originalValues.department) {
      console.log(
        "department changed:",
        currentValues.department,
        originalValues.department
      );
      return true;
    }
    if (currentValues.designation !== originalValues.designation) {
      console.log(
        "designation changed:",
        currentValues.designation,
        originalValues.designation
      );
      return true;
    }

    // Compare dates - handle null/undefined cases
    const currentJoining = currentValues.dateOfJoining
      ? new Date(currentValues.dateOfJoining).toISOString()
      : null;
    const originalJoining = originalValues.dateOfJoining
      ? new Date(originalValues.dateOfJoining).toISOString()
      : null;
    if (currentJoining !== originalJoining) {
      console.log("dateOfJoining changed:", currentJoining, originalJoining);
      return true;
    }

    const currentBirth = currentValues.dateOfBirth
      ? new Date(currentValues.dateOfBirth).toISOString()
      : null;
    const originalBirth = originalValues.dateOfBirth
      ? new Date(originalValues.dateOfBirth).toISOString()
      : null;
    if (currentBirth !== originalBirth) {
      console.log("dateOfBirth changed:", currentBirth, originalBirth);
      return true;
    }

    console.log("No changes detected");
    return false;
  };

  // Initialize form
  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(UserSettingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      employeeId: "",
      mobile: "",
      department: "",
      dateOfJoining: undefined,
      dateOfBirth: undefined,
      designation: "",
      roleName: undefined,
      approverId: "",
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/settings");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "Failed to fetch user profile";
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setUserProfile(data);

        // Create initial values object
        const initialValues = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          employeeId: data.employeeId || "",
          mobile: data.mobile || "",
          department: data.department || "",
          dateOfJoining: data.dateOfJoining
            ? new Date(data.dateOfJoining)
            : undefined,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : undefined,
          designation: data.designation || "",
          roleName: data.roleName ?? undefined,
          approverId: data.approverId || "",
        };

        // Store original values for comparison
        setOriginalValues(initialValues);

        // Update form values
        form.reset(initialValues);
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        toast.error(error.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]); // Close the first useEffect hook

  // Watch for form changes
  useEffect(() => {
    // Subscribe to form changes
    const subscription = form.watch((value, { name, type }) => {
      console.log(`Form field changed: ${name}, type: ${type}`);
      
      // Force check for changes after a short delay to ensure values are updated
      setTimeout(() => {
        const changes = hasFormChanges();
        console.log("Form watch - has changes:", changes);
        setHasChanges(changes);
      }, 10);
    });
    
    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [originalValues, form]); // Re-run when originalValues or form changes

  // Handle form submission
  const onSubmit = async (values: UserSettingsFormValues) => {
    try {
      // Log form values to help with debugging
      console.log("Form submitted with values:", values);
      console.log("Form validation state:", form.formState);

      setIsLoading(true);

      // Create a copy of the values to submit
      const dataToSubmit = { ...values };

      // Fix roleName format if needed
      if (typeof dataToSubmit.roleName === "string") {
        const roleUpper = dataToSubmit.roleName.toUpperCase();
        if (roleUpper === "SUBMITTER") {
          dataToSubmit.roleName = "Submitter";
        } else if (roleUpper === "APPROVER") {
          dataToSubmit.roleName = "Approver";
        }
      }

      // Don't send empty approverId to avoid foreign key constraint issues
      if (!dataToSubmit.approverId || dataToSubmit.approverId.trim() === "") {
        delete dataToSubmit.approverId;
      }

      // Handle date fields - ensure they're valid dates or null
      try {
        if (dataToSubmit.dateOfJoining) {
          // Ensure it's a valid date object
          dataToSubmit.dateOfJoining = new Date(dataToSubmit.dateOfJoining);
        } else {
          dataToSubmit.dateOfJoining = null;
        }

        if (dataToSubmit.dateOfBirth) {
          // Ensure it's a valid date object
          dataToSubmit.dateOfBirth = new Date(dataToSubmit.dateOfBirth);
        } else {
          dataToSubmit.dateOfBirth = null;
        }
      } catch (dateError) {
        console.error("Error processing dates:", dateError);
        toast.error("Invalid date format. Please check date fields.");
        setIsLoading(false);
        return;
      }

      console.log("Sending data to API:", dataToSubmit);

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        const errorMessage =
          errorData.error ||
          `Failed to update user profile (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const updatedProfile = await response.json();
      console.log("Updated profile data:", updatedProfile);

      // Update the user profile state
      setUserProfile(updatedProfile);

      // Create new original values from updated profile
      const newOriginalValues = {
        firstName: updatedProfile.firstName || "",
        lastName: updatedProfile.lastName || "",
        employeeId: updatedProfile.employeeId || "",
        mobile: updatedProfile.mobile || "",
        department: updatedProfile.department || "",
        dateOfJoining: updatedProfile.dateOfJoining
          ? new Date(updatedProfile.dateOfJoining)
          : undefined,
        dateOfBirth: updatedProfile.dateOfBirth
          ? new Date(updatedProfile.dateOfBirth)
          : undefined,
        designation: updatedProfile.designation || "",
        roleName: updatedProfile.roleName ?? undefined,
        approverId: updatedProfile.approverId || "",
      };

      // Update original values for future comparisons
      setOriginalValues(newOriginalValues);

      // Reset form with new values
      form.reset(newOriginalValues, {
        keepDirty: false,
        keepTouched: false,
        keepIsValid: true,
        keepIsSubmitted: false,
        keepErrors: false,
        keepValues: true,
        keepDefaultValues: false
      });

      // Reset changes state
      setHasChanges(false);
      
      // Log the state after reset
      console.log("Form reset after save, isDirty:", form.formState.isDirty);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state when initially loading profile
  if (isLoading && !userProfile) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <Loader text="Loading profile..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </Head>
      <div className="p-4 overflow-y-auto max-h-[100vh] pb-20 w-full">
      <Card className="overflow-visible">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <CardTitle>My Profile</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end items-stretch gap-2">
              {!isEditing ? (
                <>
                  <SignoutButton
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </SignoutButton>
                  <Button
                    variant="default"
                    onClick={() => {
                      // Reset hasChanges when entering edit mode
                      setHasChanges(false);
                      
                      // Make sure form values match current profile data
                      if (userProfile) {
                        const currentValues = {
                          firstName: userProfile.firstName || "",
                          lastName: userProfile.lastName || "",
                          employeeId: userProfile.employeeId || "",
                          mobile: userProfile.mobile || "",
                          department: userProfile.department || "",
                          dateOfJoining: userProfile.dateOfJoining
                            ? new Date(userProfile.dateOfJoining)
                            : undefined,
                          dateOfBirth: userProfile.dateOfBirth
                            ? new Date(userProfile.dateOfBirth)
                            : undefined,
                          designation: userProfile.designation || "",
                          roleName: userProfile.roleName ?? undefined,
                          approverId: userProfile.approverId || "",
                        };
                        
                        // Update original values for comparison
                        setOriginalValues(currentValues);
                        
                        // Reset form with current values
                        form.reset(currentValues);
                      }
                      
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-visible">
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 overflow-visible"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-visible">
                  {/* Left column */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Manually check for changes after field update
                                setTimeout(() => {
                                  const hasFieldChanges = hasFormChanges();
                                  console.log(
                                    "First name changed, form has changes:",
                                    hasFieldChanges
                                  );
                                  setHasChanges(hasFieldChanges);
                                }, 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Manually check for changes after field update
                                setTimeout(() => {
                                  const hasFieldChanges = hasFormChanges();
                                  console.log(
                                    "Last name changed, form has changes:",
                                    hasFieldChanges
                                  );
                                  setHasChanges(hasFieldChanges);
                                }, 0);
                              }}
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
                        <FormItem>
                          <FormLabel>Employee ID</FormLabel>
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
                        <FormItem>
                          <FormLabel>Mobile</FormLabel>
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
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="dateOfJoining"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Joining</FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                startMonth={new Date(1900, 0)}
                                endMonth={
                                  new Date(new Date().getFullYear(), 11)
                                }
                                selected={field.value ?? undefined}
                                onSelect={(date) =>
                                  field.onChange(date || undefined)
                                }
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
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
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                startMonth={new Date(1900, 0)}
                                endMonth={
                                  new Date(new Date().getFullYear(), 11)
                                }
                                selected={field.value ?? undefined}
                                onSelect={(date) =>
                                  field.onChange(date || undefined)
                                }
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
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
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
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
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-end gap-2 md:gap-3">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (originalValues) {
                        // Reset to original values
                        form.reset(originalValues);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => {
                      console.log("Save button clicked");
                      console.log("Form state:", form.formState);
                      console.log("Is form dirty:", form.formState.isDirty);
                      console.log("Has changes (state):", hasChanges);
                      console.log("Has changes (function):", hasFormChanges());

                      // Get current form values
                      const formValues = form.getValues();
                      console.log("Form values:", formValues);
                      console.log("Original values:", originalValues);

                      // Fix roleName if needed (convert to proper format)
                      // TypeScript safe way to handle the conversion
                      const roleValue = String(
                        formValues.roleName
                      ).toUpperCase();
                      if (roleValue === "SUBMITTER") {
                        formValues.roleName = "Submitter";
                      } else if (roleValue === "APPROVER") {
                        formValues.roleName = "Approver";
                      }

                      // Force submit regardless of validation state
                      onSubmit(formValues);
                    }}
                    disabled={!hasChanges || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader size="sm" className="text-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-visible">
              {/* Left column - Personal details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Name</div>
                  </div>
                  <div className="pl-0 sm:pl-0">
                    {userProfile?.firstName && userProfile?.lastName
                      ? `${userProfile?.firstName} ${userProfile?.lastName}`
                      : userProfile?.name || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Email Address</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.email}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Employee ID</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.employeeId || "-"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Mobile</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.mobile || "-"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Department</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.department || "-"}</div>
                </div>
              </div>

              {/* Right column - Additional details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">
                      Date of Joining
                    </div>
                  </div>
                  <div className="pl-0 sm:pl-0">
                    {userProfile?.dateOfJoining
                      ? format(new Date(userProfile.dateOfJoining), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Date of Birth</div>
                  </div>
                  <div className="pl-0 sm:pl-0">
                    {userProfile?.dateOfBirth
                      ? format(new Date(userProfile.dateOfBirth), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Designation</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.designation || "-"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Role</div>
                  </div>
                  <div className="pl-0 sm:pl-0">{userProfile?.roleName || "Submitter"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 break-words">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div className="text-sm text-slate-500">Submits To</div>
                  </div>
                  {userProfile?.approver ? (
                    <div className="flex flex-row items-center gap-2 pl-0 sm:pl-0 mt-1 sm:mt-0">
                      <Avatar className="h-8 w-8 bg-pink-100 flex-shrink-0">
                        <AvatarFallback className="text-pink-500">
                          {userProfile.approver.firstName?.[0] || ""}
                          {userProfile.approver.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <div className="truncate">
                          {userProfile.approver.firstName}{" "}
                          {userProfile.approver.lastName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {userProfile.approver.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-0 sm:pl-0">-</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
