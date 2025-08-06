"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  Edit,
  Trash2,
  AlertTriangle,
  Ban, 
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Removed unused UserData import
import UserFormDialog, { UserFormValues } from "./UserFormDialog";

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUBMITTER";
  company: string;
  approver?: string;
  approverId?: string;
  emailVerified?: Date | null;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEditUser?: (id: string, userData: UserFormValues) => void;
  onDeleteUser?: (id: string) => void;
  onMarkInactive?: (id: string) => void; // Fixed: Added missing prop
  currentUserId?: string; // Current logged-in user ID
}

export default function UserCard({
  id,
  name,
  email,
  role,
  company,
  approver,
  approverId,
  emailVerified,
  isSelected = false,
  onToggleSelect,
  onEditUser,
  onDeleteUser,
  onMarkInactive, // Fixed: Destructured the new prop
  currentUserId,
}: UserCardProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEmailVerified, setLocalEmailVerified] = useState(emailVerified);

  // Dialog visibility states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false); // Fixed: Added missing state

  // Default values for edit form
  const editFormDefaultValues = {
    name,
    email,
    role,
    company,
    approver: approver || "",
    approverId: approverId || "",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      key={id}
      className="relative grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 border-b hover:bg-gray-50"
    >
      <div className="flex justify-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(id)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-blue-100">
          <AvatarFallback className="text-blue-600">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              {name}
              {!localEmailVerified && (
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  Unverified
                </span>
              )}
              {isVerifying && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">
                  Verifying...
                </span>
              )}
              {localEmailVerified && !isVerifying && (
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20">
                  Verified
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>
        </div>
      </div>
      <div className="text-sm pl-1">{role}</div>
      <div className="text-sm pl-1">
        {approver && (
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6 bg-yellow-100">
              <AvatarFallback className="text-xs text-yellow-600">
                {approver
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{approver}</span>
          </div>
        )}
      </div>
      <div className="absolute right-4">
        {/* Hide dropdown menu if this is the current logged-in user */}
        {id !== currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              
              {!localEmailVerified && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={async () => {
                    try {
                      setIsVerifying(true);
                      const response = await fetch(`/api/admin/users/${id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ verify: true }),
                      });
                      
                      if (response.ok) {
                        // Update local state instead of refreshing the page
                        setLocalEmailVerified(new Date());
                        // Also refresh the router to update other components
                        router.refresh();
                      }
                    } catch (error) {
                      console.error("Error verifying user:", error);
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Verify User
                    </>
                  )}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Edit User Dialog */}
      <UserFormDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
        onSubmit={async (data) => {
          if (onEditUser) {
            await onEditUser(id, data);
            setIsEditDialogOpen(false); // Close dialog on success
          }
        }}
        title="Edit User"
        description={`Update user information for ${name}.`}
        submitButtonText="Save Changes"
        disableNameEmail={true}
        defaultValues={editFormDefaultValues}
      />

      {/* Fixed: Rebuilt the 'Mark as Inactive' Dialog with correct structure */}
      <Dialog
        open={isInactiveDialogOpen}
        onOpenChange={setIsInactiveDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark User as Inactive</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {name} as inactive? They will no
              longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3">
            <Ban className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-600">
              This action can be reversed later.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInactiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onMarkInactive?.(id);
                setIsInactiveDialogOpen(false);
              }}
            >
              Mark as Inactive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3 border rounded-md p-3 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500 font-medium">
              This will permanently delete the user and all associated data.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (onDeleteUser) {
                  try {
                    setIsDeleting(true);
                    await onDeleteUser(id);
                    setIsDeleteDialogOpen(false);
                    router.refresh();
                  } catch (error) {
                    console.error("Error deleting user:", error);
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
