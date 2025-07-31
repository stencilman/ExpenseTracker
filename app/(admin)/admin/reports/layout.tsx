import { TabNavigation } from "@/components/navigation/TabNavigation";

export default function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <TabNavigation
        tabs={[
          {
            label: "All Reports",
            href: "/admin/reports/all",
          },
          {
            label: "Awaiting Approval",
            href: "/admin/reports/awaiting-approval",
          },
          {
            label: "Awaiting Reimbursement",
            href: "/admin/reports/awaiting-reimbursement",
          },
          {
            label: "Reimbursed",
            href: "/admin/reports/reimbursed",
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
