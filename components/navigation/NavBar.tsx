"use client";

import { HelpCircle, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SideNav from "@/components/navigation/SideNav";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import NotificationsDropdown from "@/components/notification/NotificationsDropdown";
import NavbarOptions from "@/components/navigation/navbar-options";
import Image from "next/image";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="h-16 border-b bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/brain.png" alt="FastcodeAI" width={25} height={25} />
            <h1 className="text-lg sm:text-xl font-bold">Expense Tracker</h1>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center space-x-2">
          <NotificationsDropdown />
          <NavbarOptions />
        </div>
      </div>

      {/* Mobile SideNav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
            <SideNav onNavItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
