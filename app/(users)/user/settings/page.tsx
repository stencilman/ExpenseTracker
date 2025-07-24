"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Briefcase,
  Calendar,
  Phone,
  Building,
  CalendarDays,
  Award,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import SignoutButton from "@/components/auth/signout-button";

export default function SettingsPage() {
  const user = useCurrentUser();

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            <CardTitle className="flex items-center gap-2 justify-between w-full">
              <div>Personal Details</div>
              {/* signout button */}
              <SignoutButton />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Name</div>
                <div>{user?.name || "N/A"}</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Email Address</div>
                <div>{user?.email}</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Employee ID</div>
                <div>-</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Mobile</div>
                <div>-</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Department</div>
                <div>-</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Date of joining</div>
                <div>-</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Date of birth</div>
                <div>-</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Designation</div>
                <div>-</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Role Name</div>
                <div>Submitter</div>
              </div>

              <div className="grid grid-cols-2 items-center">
                <div className="text-sm text-slate-500">Submits To</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-pink-100">
                    <AvatarFallback className="text-pink-500">P</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>prabal</div>
                    <div className="text-xs text-slate-500">
                      prabal@fastcode.ai
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-sm text-slate-500 uppercase tracking-wider mb-4">
                  Associated Policies
                </div>
                <div className="flex items-center gap-2">
                  <div>Fast Code AI</div>
                  <Badge
                    variant="outline"
                    className="bg-blue-600 text-white border-0 text-xs"
                  >
                    DEFAULT
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
