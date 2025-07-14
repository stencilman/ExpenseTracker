"use client";

import { Building, Users, Palette, Zap } from "lucide-react";
import SettingsNavigationSection from "./SettingsNavigationSection";

export default function SettingsSideNav() {
  return (
    <div className="w-full max-w-[250px] border-r pr-4">
      <SettingsNavigationSection
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

      <SettingsNavigationSection
        header="Users and Control"
        icon={Users}
        items={[
          { label: "Users", href: "/admin/settings/users" },
          { label: "Roles & Permissions", href: "/admin/settings/roles" },
          { label: "Departments", href: "/admin/settings/departments" },
          { label: "Policies", href: "/admin/settings/policies" },
        ]}
      />
      
      <SettingsNavigationSection
        header="Customization"
        icon={Palette}
        items={[
          { label: "Modules", href: "/admin/settings/modules" },
          { label: "PDF Templates", href: "/admin/settings/pdf-templates" },
          { label: "Email Templates", href: "/admin/settings/email-templates" },
          { label: "SMS Notifications", href: "/admin/settings/sms-notifications" },
        ]}
      />
      
      <SettingsNavigationSection
        header="Automation"
        icon={Zap}
        items={[
          { label: "Report Automation", href: "/admin/settings/report-automation" },
          { label: "Workflow Rules", href: "/admin/settings/workflow-rules" },
          { label: "Actions", href: "/admin/settings/actions" },
        ]}
      />
    </div>
  );
}
