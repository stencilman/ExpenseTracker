"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, PlusCircle, MoreVertical, Loader2 } from "lucide-react";
import UserCard from "@/components/admin/settings/user/UserCard";
import AddNewUserDialog from "@/components/admin/settings/user/AddNewUserDialog";
import { useSession } from "next-auth/react";

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

  // Handler for editing a user
  const handleEditUser = async (userId: string, userData: any) => {
    try {
      // Map UI role names to Prisma roles
      const mappedData = {
        role: userData.role === "SUBMITTER" ? "USER" : userData.role,
        approverId: userData.approverId || null,
        roleName: userData.role === "SUBMITTER" ? "SUBMITTER" : null,
      };

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const { data } = await response.json();

      // Update the user in the local state
      setUsersList((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? data : user))
      );
    } catch (err) {
      console.error(`Error updating user ${userId}:`, err);
      // You could add a toast notification here
    }
  };

  // Handler for marking a user as inactive
  const handleMarkInactive = (userId: string) => {
    console.log(`Marking user ${userId} as inactive`);
    // In a real app, you would update the user's status in the database
    // For now, we'll just log it
  };

  // Handler for deleting a user
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update local state after successful deletion
      setUsersList((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-green-600 flex items-center gap-1">
            <span className="inline-flex items-center">🟢</span>
            <span>Active Users: {usersList.length}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white overflow-y-auto max-h-[calc(100vh-15rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32 text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b text-sm font-medium text-gray-500">
                <div className="flex justify-center">
                  <Checkbox
                    checked={
                      selectedUsers.size > 0 &&
                      selectedUsers.size === filteredUsers.length
                    }
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  />
                </div>
                <div className="pl-1">USER DETAILS</div>
                <div className="pl-1">ROLE</div>
                <div className="pl-1">SUBMITS TO</div>
                <div></div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="flex justify-center items-center h-32 text-gray-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    id={user.id}
                    name={`${user.firstName} ${user.lastName}`}
                    email={user.email}
                    role={
                      user.role === "ADMIN"
                        ? "ADMIN"
                        : ("SUBMITTER" as "SUBMITTER")
                    }
                    company={user.department || ""}
                    approver={
                      user.approver
                        ? `${user.approver.firstName} ${user.approver.lastName}`
                        : undefined
                    }
                    approverId={user.approverId || undefined}
                    emailVerified={user.emailVerified}
                    isSelected={selectedUsers.has(user.id)}
                    onToggleSelect={toggleUserSelection}
                    onEditUser={handleEditUser}
                    onMarkInactive={handleMarkInactive}
                    currentUserId={currentUserId}
                    onDeleteUser={handleDeleteUser}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      <AddNewUserDialog
        open={isAddNewUserDialogOpen}
        onOpenChange={setIsAddNewUserDialogOpen}
        onAddUser={(userData) => {
          console.log("New user data:", userData);
          // Here you would typically add the user to your database
          // For now, we'll just log the data
          // You could also update the users state here if needed
        }}
      />
    </div>
  );
}
