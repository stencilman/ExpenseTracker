"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@prisma/client";

export const UserRoleInfo = () => {
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <span>Current role:</span>
          {user.role === UserRole.ADMIN ? (
            <Badge className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
          ) : (
            <Badge className="bg-blue-600 hover:bg-blue-700">User</Badge>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Access Level:</h3>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            {user.role === UserRole.ADMIN ? (
              <>
                <li>Full access to admin dashboard</li>
                <li>User management capabilities</li>
                <li>System configuration access</li>
                <li>Analytics and reporting</li>
              </>
            ) : (
              <>
                <li>Access to personal dashboard</li>
                <li>Manage personal expenses</li>
                <li>Create and view reports</li>
                <li>Update personal settings</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
