"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/providers/loading-provider";
import AllExpensesTableView from "@/components/expenses/AllExpensesTable";

export default function ExpensesAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { stopLoading } = useLoading();

  // Check if we're on a specific expense detail page
  const isDetailView = pathname.split("/").length > 4;

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {isDetailView ? (
        <>
          {/* Table section - takes 1/3 of the space on desktop */}
          <div className="lg:w-1/3 overflow-auto">
            <AllExpensesTableView compact={true} />
          </div>
          {/* Detail section - takes 2/3 of the space on desktop */}
          <div className="lg:w-2/3 border-l lg:pl-4 overflow-x-hidden overflow-y-auto h-[calc(100vh-10rem)]">
            {children}
          </div>
        </>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}
