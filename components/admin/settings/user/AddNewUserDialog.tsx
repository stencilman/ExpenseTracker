"use client";

import UserFormDialog, { UserFormValues } from "./UserFormDialog";

interface AddNewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser?: (userData: UserFormValues) => void;
}

export default function AddNewUserDialog({
  open,
  onOpenChange,
  onAddUser,
}: AddNewUserDialogProps) {
  const handleSubmit = (data: UserFormValues) => {
    console.log("Form submitted:", data);
    onAddUser?.(data);
  };

  return (
    <UserFormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      title="Add New User"
      description="Create a new user account with the following details."
      submitButtonText="Create User"
      defaultValues={{
        name: "",
        email: "",
        role: "SUBMITTER",
        company: "",
        approver: "",
      }}
    />
  );
}
