"use client";

import { Building, Users, Palette, Zap } from "lucide-react";
import SettingsNavigationSection from "./SettingsNavigationSection";

export default function SettingsSideNav() {
  return (
    <div className="w-full max-w-[250px] border-r pr-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <SettingsNavigationSection
        header="Organization"
        icon={Building}
        items={[
          {
            label: "Organization Profile",
            href: "/admin/settings/organization",
          },
        ]}
      />

      <SettingsNavigationSection
        header="Users and Control"
        icon={Users}
        items={[{ label: "Users", href: "/admin/settings/users" }]}
      />
    </div>
  );
}
