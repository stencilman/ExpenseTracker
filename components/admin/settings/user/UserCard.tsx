"use client";

import { useState } from "react";
import { MoreHorizontal, Mail, Edit, Ban, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserData } from "@/app/(admin)/admin/settings/users/page";

interface UserCardProps extends UserData {
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
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
}: UserCardProps) {
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
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Edit className="h-4 w-4 text-gray-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-gray-500">
              <Ban className="h-4 w-4 text-gray-500" />
              Mark as Inactive
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-500">
              <Trash2 className="h-4 w-4 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
