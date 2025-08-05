"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { format, parseISO } from "date-fns";
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
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import SignoutButton from "@/components/auth/signout-button";
import {
  UserSettingsSchema,
  UserSettingsFormValues,
  ROLE_NAMES,
} from "@/lib/validations/user";
import { toast } from "sonner";

export default function SettingsPage() {
  const currentUser = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  // Approvers are managed by admins, not by users themselves

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

  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/settings");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "Failed to fetch user settings";
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setUserSettings(data);

        // Update form values
        form.reset({
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
          roleName: data.roleName || "",
          approverId: data.approverId || "",
        });
      } catch (error: any) {
        console.error("Error fetching user settings:", error);
        toast.error(error.message || "Failed to load user settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [form]);

  // Handle form submission
  const onSubmit = async (values: UserSettingsFormValues) => {
    try {
      setIsLoading(true);

      // Create a copy of the values to submit
      const dataToSubmit = { ...values };

      // Don't send empty approverId to avoid foreign key constraint issues
      if (!dataToSubmit.approverId || dataToSubmit.approverId.trim() === "") {
        delete dataToSubmit.approverId;
      }

      // Handle date fields - ensure they're valid dates or null
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

      console.log("Submitting data:", dataToSubmit);

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to update user settings";
        throw new Error(errorMessage);
      }

      const updatedSettings = await response.json();
      setUserSettings(updatedSettings);
      toast.success("User settings updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating user settings:", error);
      toast.error(error.message || "Failed to update user settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state when initially loading settings
  if (isLoading && !userSettings) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <CardTitle>Personal Details</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to current values
                    if (userSettings) {
                      form.reset({
                        firstName: userSettings.firstName || "",
                        lastName: userSettings.lastName || "",
                        employeeId: userSettings.employeeId || "",
                        mobile: userSettings.mobile || "",
                        department: userSettings.department || "",
                        dateOfJoining: userSettings.dateOfJoining
                          ? new Date(userSettings.dateOfJoining)
                          : undefined,
                        dateOfBirth: userSettings.dateOfBirth
                          ? new Date(userSettings.dateOfBirth)
                          : undefined,
                        designation: userSettings.designation || "",
                        roleName: userSettings.roleName || "",
                        approverId: userSettings.approverId || "",
                      });
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              <SignoutButton />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
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
                            <Input placeholder="Last name" {...field} />
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
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
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

                    <FormField
                      control={form.control}
                      name="roleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                            disabled={currentUser?.role === "USER"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROLE_NAMES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {currentUser?.role === "USER" && (
                            <FormDescription>
                              Your role is managed by your administrator.
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Approver is set by admins, not by users themselves */}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="w-full md:w-auto flex items-center gap-1"
                    disabled={!form.formState.isDirty || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column - Personal details */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Name</div>
                  <div>
                    {userSettings?.firstName && userSettings?.lastName
                      ? `${userSettings?.firstName} ${userSettings?.lastName}`
                      : userSettings?.name || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Email Address</div>
                  <div>{userSettings?.email}</div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Employee ID</div>
                  <div>{userSettings?.employeeId || "-"}</div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Mobile</div>
                  <div>{userSettings?.mobile || "-"}</div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Department</div>
                  <div>{userSettings?.department || "-"}</div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Date of joining</div>
                  <div>
                    {userSettings?.dateOfJoining
                      ? format(new Date(userSettings.dateOfJoining), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Date of birth</div>
                  <div>
                    {userSettings?.dateOfBirth
                      ? format(new Date(userSettings.dateOfBirth), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Designation</div>
                  <div>{userSettings?.designation || "-"}</div>
                </div>
              </div>

              {/* Right column - Role details */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Role Name</div>
                  <div>{userSettings?.roleName || "Submitter"}</div>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="text-sm text-slate-500">Submits To</div>
                  {userSettings?.approver ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-pink-100">
                        <AvatarFallback className="text-pink-500">
                          {userSettings.approver.firstName?.[0] || ""}
                          {userSettings.approver.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>
                          {userSettings.approver.firstName}{" "}
                          {userSettings.approver.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {userSettings.approver.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>-</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
