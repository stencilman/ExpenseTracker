"use client";

import { Building, Users } from "lucide-react";
import SettingsSection from "@/components/admin/settings/SettingsSection";

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SettingsSection
          header="Organization"
          icon={Building}
          items={[
            {
              label: "Organization Profile",
              href: "/admin/settings/organization",
            },
            { label: "Branding", href: "/admin/settings/branding" },
            { label: "Currencies", href: "/admin/settings/currencies" },
            { label: "Taxes", href: "/admin/settings/taxes" },
            { label: "Tags", href: "/admin/settings/tags" },
            {
              label: "Subscription",
              href: "https://billing.expensetracker.com",
              external: true,
            },
          ]}
        />

        <SettingsSection
          header="Users and Control"
          icon={Users}
          items={[
            { label: "Users", href: "/admin/settings/users" },
            { label: "Roles & Permissions", href: "/admin/settings/roles" },
            { label: "Departments", href: "/admin/settings/departments" },
            { label: "Policies", href: "/admin/settings/policies" },
          ]}
        />
      </div>
    </div>
  );
}
