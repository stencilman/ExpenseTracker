"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsSideNav from "@/components/admin/settings/navigation/SettingsSideNav";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isRootSettingsPage = pathname === "/admin/settings";
  
  return (
    <div className="flex">
      {!isRootSettingsPage && <SettingsSideNav />}
      <div className="flex-1">
        {!isRootSettingsPage && (
          <div className="sm:hidden p-4 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => router.push("/admin/settings")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
          </div>
        )}
        <div className={`${!isRootSettingsPage ? "p-6" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
