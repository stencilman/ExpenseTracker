"use client";

import { Home, FileText, Receipt, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  onNavItemClick?: () => void;
}

export default function SideNav({ onNavItemClick }: SideNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div 
      className={`${collapsed ? 'w-16' : 'w-64'} h-screen bg-slate-50 border-r transition-all duration-300 relative`}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-4 bg-white border shadow-sm z-10 rounded-full h-6 w-6 p-0 hidden md:flex"
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={`${collapsed ? 'p-3' : 'p-6'}`}>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavItemClick}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`}
                />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
