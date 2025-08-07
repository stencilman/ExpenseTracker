"use client";

import { TabNavigation } from "@/components/navigation/TabNavigation";
import React from "react";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <TabNavigation
        tabs={[
          {
            label: "Pending Reports",
            href: "/user/reports/pending",
          },
          {
            label: "Submitted Reports",
            href: "/user/reports/submitted",
          },
          {
            label: "All Reports",
            href: "/user/reports/all",
          },
        ]}
        variant="underline"
        size="lg"
        activeColor="blue-600"
        exactMatch={false}
      />

      <div className="mt-6 overflow-y-auto">{children}</div>
    </div>
  );
}
