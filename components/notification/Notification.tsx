import React from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotificationProps {
  title: string;
  content: string;
  timestamp: string;
  status?: "read" | "unread";
}

export default function Notification({
  title,
  content,
  timestamp,
  status = "read",
}: NotificationProps) {
  return (
    <DropdownMenuItem
      className={cn(
        "cursor-pointer",
        status === "unread" && "bg-blue-50 rounded-sm data-[highlighted]:bg-blue-100 data-[highlighted]:text-foreground"
      )}
    >
      <div className={cn("flex flex-col gap-1 w-full")}>
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "font-medium",
              status === "unread" && "font-semibold"
            )}
          >
            {title}
          </p>
          {status === "unread" && (
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{content}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </DropdownMenuItem>
  );
}
