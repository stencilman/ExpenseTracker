"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/providers/LoadingProvider";
import ReportedExpensesTable from "@/components/expenses/ReportedExpensesTable";

export default function ReportedExpensesLayout({
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
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-10rem)] lg:overflow-hidden gap-4">
      {isDetailView ? (
        <>
          {/* Table section - takes 1/3 of the space on desktop */}
          <div className="hidden lg:block lg:w-1/3 overflow-y-auto h-full">
            <ReportedExpensesTable compact={true} />
          </div>
          {/* Detail section - takes 2/3 of the space on desktop */}
          <div className="flex-1 w-full lg:w-2/3 border-l lg:pl-4 overflow-y-auto h-full">
            {children}
          </div>
        </>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}
