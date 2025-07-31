"use client";

import { useState } from "react";
import { Check, ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for roles and permissions
const initialRoles = [
  {
    id: "1",
    name: "Admin",
    description: "Full access to all features",
    permissions: [
      "manage_users",
      "manage_roles",
      "approve_reports",
      "reject_reports",
      "view_all_reports",
      "manage_expenses",
      "view_analytics",
      "manage_settings",
    ],
    userCount: 3,
    isSystem: true,
  },
  {
    id: "2",
    name: "Submitter",
    description: "Can submit and view own reports",
    permissions: [
      "submit_reports",
      "view_own_reports",
      "edit_own_reports",
      "submit_expenses",
    ],
    userCount: 12,
    isSystem: true,
  },
  {
    id: "3",
    name: "Approver",
    description: "Can approve and reject reports",
    permissions: [
      "approve_reports",
      "reject_reports",
      "view_team_reports",
      "view_analytics",
    ],
    userCount: 5,
    isSystem: false,
  },
  {
    id: "4",
    name: "Finance",
    description: "Access to financial reports and reimbursements",
    permissions: [
      "view_all_reports",
      "manage_expenses",
      "record_reimbursements",
      "view_analytics",
    ],
    userCount: 2,
    isSystem: false,
  },
];

// All available permissions grouped by category
const allPermissions = [
  {
    category: "Reports",
    permissions: [
      { id: "submit_reports", name: "Submit Reports" },
      { id: "view_own_reports", name: "View Own Reports" },
      { id: "view_team_reports", name: "View Team Reports" },
      { id: "view_all_reports", name: "View All Reports" },
      { id: "edit_own_reports", name: "Edit Own Reports" },
      { id: "approve_reports", name: "Approve Reports" },
      { id: "reject_reports", name: "Reject Reports" },
    ],
  },
  {
    category: "Expenses",
    permissions: [
      { id: "submit_expenses", name: "Submit Expenses" },
      { id: "manage_expenses", name: "Manage Expenses" },
      { id: "record_reimbursements", name: "Record Reimbursements" },
    ],
  },
  {
    category: "Administration",
    permissions: [
      { id: "manage_users", name: "Manage Users" },
      { id: "manage_roles", name: "Manage Roles" },
      { id: "manage_settings", name: "Manage Settings" },
      { id: "view_analytics", name: "View Analytics" },
    ],
  },
];

export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [activeTab, setActiveTab] = useState("roles");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Handle opening the edit dialog
  const handleEditRole = (role: any) => {
    setCurrentRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description);
    setSelectedPermissions([...role.permissions]);
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteRole = (role: any) => {
    setCurrentRole(role);
    setIsDeleteDialogOpen(true);
  };

  // Handle creating a new role
  const handleCreateRole = () => {
    const newRole = {
      id: `${roles.length + 1}`,
      name: newRoleName,
      description: newRoleDescription,
      permissions: selectedPermissions,
      userCount: 0,
      isSystem: false,
    };

    setRoles([...roles, newRole]);
    resetFormState();
    setIsCreateDialogOpen(false);
  };

  // Handle updating an existing role
  const handleUpdateRole = () => {
    if (!currentRole) return;

    const updatedRoles = roles.map((role) => {
      if (role.id === currentRole.id) {
        return {
          ...role,
          name: newRoleName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        };
      }
      return role;
    });

    setRoles(updatedRoles);
    resetFormState();
    setIsEditDialogOpen(false);
  };

  // Handle deleting a role
  const handleConfirmDelete = () => {
    if (!currentRole) return;

    const filteredRoles = roles.filter((role) => role.id !== currentRole.id);
    setRoles(filteredRoles);
    setIsDeleteDialogOpen(false);
    setCurrentRole(null);
  };

  // Reset form state
  const resetFormState = () => {
    setCurrentRole(null);
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedPermissions([]);
  };

  // Handle opening the create dialog
  const handleOpenCreateDialog = () => {
    resetFormState();
    setIsCreateDialogOpen(true);
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Check if a permission is selected
  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="h-[calc(100vh-20rem)] overflow-y-auto  space-y-4">
            {roles.map((role) => (
              <Card key={role.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {role.name}
                        {role.isSystem && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            System
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Role
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteRole(role)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">
                      Permissions ({role.permissions.length})
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {role.userCount} users
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {allPermissions.flatMap((category) =>
                      category.permissions
                        .filter((permission) =>
                          role.permissions.includes(permission.id)
                        )
                        .slice(0, 6)
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center text-sm"
                          >
                            <Check className="mr-2 h-3 w-3 text-primary" />
                            {permission.name}
                          </div>
                        ))
                    )}
                    {role.permissions.length > 6 && (
                      <div className="text-sm text-muted-foreground">
                        +{role.permissions.length - 6} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="h-[calc(100vh-20rem)] overflow-y-auto  space-y-4">
            {allPermissions.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {
                              roles.filter((role) =>
                                role.permissions.includes(permission.id)
                              ).length
                            }{" "}
                            roles
                          </p>
                        </div>
                        <div>
                          {roles
                            .filter((role) =>
                              role.permissions.includes(permission.id)
                            )
                            .slice(0, 3)
                            .map((role) => (
                              <span
                                key={role.id}
                                className="inline-block mr-1 px-2 py-1 text-xs bg-muted rounded-full"
                              >
                                {role.name}
                              </span>
                            ))}
                          {roles.filter((role) =>
                            role.permissions.includes(permission.id)
                          ).length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-muted rounded-full">
                              +
                              {roles.filter((role) =>
                                role.permissions.includes(permission.id)
                              ).length - 3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role and assign permissions for users in your
              organization.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Finance Manager"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Briefly describe this role's purpose"
              />
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Permissions</Label>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
                {allPermissions.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="text-sm font-medium border-b pb-1">
                      {category.category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={isPermissionSelected(permission.id)}
                            onCheckedChange={() =>
                              togglePermission(permission.id)
                            }
                          />
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || selectedPermissions.length === 0}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={currentRole?.isSystem}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Permissions</Label>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
                {allPermissions.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="text-sm font-medium border-b pb-1">
                      {category.category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-permission-${permission.id}`}
                            checked={isPermissionSelected(permission.id)}
                            onCheckedChange={() =>
                              togglePermission(permission.id)
                            }
                          />
                          <Label
                            htmlFor={`edit-permission-${permission.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={!newRoleName.trim() || selectedPermissions.length === 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{currentRole?.name}"?
              {currentRole?.userCount > 0 && (
                <span className="text-destructive font-medium">
                  {" "}
                  This will affect {currentRole?.userCount} users.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
