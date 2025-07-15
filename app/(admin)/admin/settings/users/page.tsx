"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, PlusCircle, MoreVertical } from "lucide-react";
import UserCard from "@/components/admin/settings/user/UserCard";
import AddNewUserDialog from "@/components/admin/settings/user/AddNewUserDialog";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUBMITTER";
  company: string;
  approver?: string;
}

const users: UserData[] = [
  {
    id: "1",
    name: "Akash",
    email: "akash@fastcode.ai",
    role: "SUBMITTER",
    company: "Fast Code AI",
    approver: "Prabal",
  },
  {
    id: "2",
    name: "Arjun",
    email: "arjun@fastcode.ai",
    role: "ADMIN",
    company: "Fast Code AI",
  },
  {
    id: "3",
    name: "Ashish Kumar",
    email: "ashish@fastcode.ai",
    role: "SUBMITTER",
    company: "Fast Code AI",
    approver: "Prabal",
  },
  {
    id: "4",
    name: "Dhaval",
    email: "dhaval@fastcode.ai",
    role: "SUBMITTER",
    company: "Fast Code AI",
    approver: "Prabal",
  },
];

export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddNewUserDialogOpen, setIsAddNewUserDialogOpen] = useState(false);

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

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.company.toLowerCase().includes(query) ||
      (user.approver && user.approver.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-green-600 flex items-center gap-1">
            <span className="inline-flex items-center">🟢</span>
            <span>Subscribed Users: 22/25</span>
            <span className="ml-1 text-gray-500">ⓘ</span>
          </div>
          <Button
            className="flex items-center gap-1"
            onClick={() => setIsAddNewUserDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>New User</span>
          </Button>

          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
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
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b text-sm font-medium text-gray-500">
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
            <div className="pl-1">POLICY</div>
            <div className="pl-1">SUBMITS TO</div>
            <div></div>
          </div>

          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              name={user.name}
              email={user.email}
              role={user.role}
              company={user.company}
              approver={user.approver}
              isSelected={selectedUsers.has(user.id)}
              onToggleSelect={toggleUserSelection}
            />
          ))}
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
