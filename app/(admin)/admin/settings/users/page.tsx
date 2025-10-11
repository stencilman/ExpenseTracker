"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  PlusCircle,
  MoreVertical,
  Loader2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserCard from "@/components/admin/settings/user/UserCard";
import AddNewUserDialog from "@/components/admin/settings/user/AddNewUserDialog";
import UserFormDialog, {
  UserFormValues,
} from "@/components/admin/settings/user/UserFormDialog";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/table/DataTable";
import { ColumnDef } from "@tanstack/react-table";

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "USER";
  department?: string;
  designation?: string;
  roleName?: string | null;
  approverId?: string | null;
  emailVerified?: Date | null;
  employeeId?: string | null;
  mobile?: string | null;
  dateOfJoining?: Date | string | null;
  dateOfBirth?: Date | string | null;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Users will be fetched from the API

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [isAddNewUserDialogOpen, setIsAddNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<{
    id: string;
    data: UserFormValues;
    originalData: UserFormValues;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUserIds = filteredUsers.map((user) => user.id);
      setSelectedUsers(new Set(allUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const { data } = await response.json();
        setUsersList(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handler for opening the edit user dialog
  const handleEditUser = (userId: string, userData: UserFormValues) => {
    const originalData = { ...userData };
    setCurrentEditUser({ id: userId, data: userData, originalData });
    setIsEditUserDialogOpen(true);
  };

  // State for tracking loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log when isSubmitting changes
  useEffect(() => {
    console.log("isSubmitting changed to:", isSubmitting);
  }, [isSubmitting]);

  // Handler for submitting the edit user form
  const submitEditUser = async (formData: UserFormValues) => {
    if (!currentEditUser) return;

    console.log("Submitting edit for user:", currentEditUser.id);
    console.log("Form data:", formData);

    console.log("Setting isSubmitting to true");
    setIsSubmitting(true);
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // Map UI role names to Prisma roles
      const mappedData = {
        firstName,
        lastName,
        email: formData.email,
        role: formData.role === "SUBMITTER" ? "USER" : formData.role,
        approverId: formData.approverId || null,
        roleName: formData.role === "SUBMITTER" ? "SUBMITTER" : null,
        employeeId: formData.employeeId || null,
        mobile: formData.mobile || null,
        department: formData.department || null,
        designation: formData.designation || null,
        dateOfJoining: formData.dateOfJoining || null,
        dateOfBirth: formData.dateOfBirth || null,
      };

      console.log("Mapped data to send to API:", mappedData);
      console.log(
        `Sending PATCH request to /api/admin/users/${currentEditUser.id}/update`
      );

      const response = await fetch(
        `/api/admin/users/${currentEditUser.id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mappedData),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to update user: ${response.status} ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);
      const { data } = responseData;

      // Update the user in the local state
      setUsersList((prevUsers) =>
        prevUsers.map((user) => (user.id === currentEditUser.id ? data : user))
      );

      // Close the dialog
      setIsEditUserDialogOpen(false);
      setCurrentEditUser(null);
    } catch (err) {
      console.error(`Error updating user ${currentEditUser.id}:`, err);
      // You could add a toast notification here
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  // Handler functions for user actions

  // Handler for deleting a user
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Update local state after successful deletion
      setUsersList((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      );

      // Also remove from selection if selected
      if (selectedUsers.has(userId)) {
        const newSelected = new Set(selectedUsers);
        newSelected.delete(userId);
        setSelectedUsers(newSelected);
      }
    } catch (err) {
      console.error(`Error deleting user ${userId}:`, err);
      // You could add a toast notification here
    }
  };

  // Filter users based on search query
  const filteredUsers = usersList.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const approverName = user.approver
      ? `${user.approver.firstName} ${user.approver.lastName}`.toLowerCase()
      : "";

    return (
      fullName.includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.department && user.department.toLowerCase().includes(query)) ||
      (user.designation && user.designation.toLowerCase().includes(query)) ||
      approverName.includes(query)
    );
  });

  // Function to generate a consistent color based on email
  const generateColorFromEmail = (email: string) => {
    // Generate a hash from the email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Define a set of background colors with good contrast
    const bgColors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-red-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-indigo-100",
      "bg-teal-100",
    ];

    // Define matching text colors for each background
    const textColors = [
      "text-blue-600",
      "text-green-600",
      "text-yellow-600",
      "text-red-600",
      "text-purple-600",
      "text-pink-600",
      "text-indigo-600",
      "text-teal-600",
    ];

    // Use the hash to pick a consistent color
    const index = Math.abs(hash) % bgColors.length;

    return {
      bg: bgColors[index],
      text: textColors[index],
    };
  };

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 200,
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.firstName} ${user.lastName}`;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(
          0
        )}`.toUpperCase();

        // Generate consistent colors based on the user's email
        const colors = generateColorFromEmail(user.email);

        return (
          <div className="flex items-center gap-2">
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center`}
            >
              <span className={`text-xs font-medium ${colors.text}`}>
                {initials}
              </span>
            </div>
            <span>{fullName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role,
    },
    {
      id: "actions",
      header: () => <div className="text-center w-full">Actions</div>,
      size: 80,
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;

        return (
          <div className="flex justify-center items-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isCurrentUser}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isCurrentUser}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    // Prepare data for edit form
                    const userData: UserFormValues = {
                      name: `${user.firstName} ${user.lastName}`,
                      email: user.email,
                      role:
                        user.role === "USER" && user.roleName === "SUBMITTER"
                          ? ("SUBMITTER" as const)
                          : user.role === "ADMIN"
                          ? ("ADMIN" as const)
                          : ("SUBMITTER" as const),
                      approverId: user.approverId || "",
                      employeeId: user.employeeId || "",
                      mobile: user.mobile || "",
                      department: user.department || "",
                      designation: user.designation || "",
                      dateOfJoining: user.dateOfJoining
                        ? new Date(user.dateOfJoining)
                        : undefined,
                      dateOfBirth: user.dateOfBirth
                        ? new Date(user.dateOfBirth)
                        : undefined,
                    };
                    handleEditUser(user.id, userData);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-[calc(100vw-4rem)] lg:w-full">
      <DataTable columns={columns} data={usersList} />

      {/* Edit User Dialog */}
      {currentEditUser && (
        <UserFormDialog
          open={isEditUserDialogOpen}
          onOpenChange={(open) => {
            setIsEditUserDialogOpen(open);
            if (!open) setCurrentEditUser(null);
          }}
          onSubmit={async (formData: UserFormValues) => {
            console.log("UserFormDialog onSubmit called with data:", formData);
            // Always submit the form data
            await submitEditUser(formData);
          }}
          isSubmitting={isSubmitting}
          title="Edit User"
          description="Update user information."
          submitButtonText="Save Changes"
          defaultValues={currentEditUser.data}
        />
      )}
    </div>
  );
}
