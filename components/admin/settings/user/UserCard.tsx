"use client";

import { useState } from "react";
import { MoreHorizontal, Mail, Edit, Ban, Trash2, AlertTriangle } from "lucide-react";
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
import { UserData } from "@/app/(admin)/admin/settings/users/page";
import UserFormDialog, { UserFormValues } from "./UserFormDialog";

// Using the shared UserFormValues type from UserFormDialog

interface UserCardProps extends UserData {
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEditUser?: (id: string, userData: UserFormValues) => void;
  onMarkInactive?: (id: string) => void;
  onDeleteUser?: (id: string) => void;
}

export default function UserCard({
  id,
  name,
  email,
  role,
  company,
  approver,
  isSelected = false,
  onToggleSelect,
  onEditUser,
  onMarkInactive,
  onDeleteUser,
}: UserCardProps) {
  // Dialog visibility states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Default values for edit form
  const editFormDefaultValues = {
    name,
    email,
    role,
    company,
    approver: approver || "",
  };
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      key={id}
      className="relative grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 border-b hover:bg-gray-50"
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
          <div className="font-medium text-blue-600">{name}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <Mail className="h-3 w-3 mr-1" />
            <span>{email}</span>
          </div>
        </div>
      </div>
      <div className="text-sm pl-1">{role}</div>
      <div className="text-sm pl-1">{company}</div>
      <div className="text-sm pl-1">
        {approver && (
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6 bg-yellow-100">
              <AvatarFallback className="text-xs text-yellow-600">
                P
              </AvatarFallback>
            </Avatar>
            <span>{approver}</span>
          </div>
        )}
      </div>
      <div className="absolute right-4">
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
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsInactiveDialogOpen(true)}
            >
              <Ban className="h-4 w-4" />
              Mark as Inactive
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-red-500"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit User Dialog */}
      <UserFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={(data) => onEditUser?.(id, data)}
        title="Edit User"
        description={`Update user information for ${name}.`}
        submitButtonText="Save Changes"
        defaultValues={editFormDefaultValues}
      />

      {/* Mark as Inactive Dialog */}
      <Dialog open={isInactiveDialogOpen} onOpenChange={setIsInactiveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark User as Inactive</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {name} as inactive? They will no longer be able to log in or submit expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3">
            <Ban className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-500">This action can be reversed later.</p>
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
              Are you sure you want to delete {name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3 border rounded-md p-3 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500 font-medium">This will permanently delete the user and all associated data.</p>
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
              onClick={() => {
                onDeleteUser?.(id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
