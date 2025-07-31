"use client";

import { usePathname } from "next/navigation";
import SettingsSideNav from "@/components/admin/settings/navigation/SettingsSideNav";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRootSettingsPage = pathname === "/admin/settings";
  
  return (
    <div className="flex">
      {!isRootSettingsPage && <SettingsSideNav />}
      <div className={`flex-1 ${!isRootSettingsPage ? "p-6" : ""}`}>{children}</div>
    </div>
  );
}
