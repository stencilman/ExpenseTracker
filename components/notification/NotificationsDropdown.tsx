import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Notification from "./Notification";

export default function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto space-y-1">
          <Notification 
            title="Report approved"
            content="Your expense report for May-June has been approved"
            timestamp="2 hours ago"
            status="unread"
          />
          <Notification 
            title="Reimbursement processed"
            content="₹1,250.00 has been transferred to your account"
            timestamp="Yesterday"
            status="read"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
