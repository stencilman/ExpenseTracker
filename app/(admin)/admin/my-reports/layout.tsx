"use client";

import { TabNavigation } from "@/components/navigation/TabNavigation";
import React from "react";

export default function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen sm:w-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-none">
        <TabNavigation
          tabs={[
            {
              label: "Pending Reports",
              href: "/admin/my-reports/pending",
            },
            {
              label: "Submitted Reports",
              href: "/admin/my-reports/submitted",
            },
            {
              label: "All Reports",
              href: "/admin/my-reports/all",
            },
          ]}
          variant="underline"
          size="lg"
          activeColor="blue-600"
          exactMatch={false}
        />
      </div>

      <div className="mt-6 pb-8 flex-grow overflow-y-auto">{children}</div>
    </div>
  );
}
