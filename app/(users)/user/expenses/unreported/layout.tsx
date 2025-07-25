"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/providers/LoadingProvider";
import UnreportedExpensesView from "@/components/expenses/UnreportedExpensesView";

export default function UnreportedExpensesLayout({
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
          {/* Card section - takes 1/3 of the space on desktop */}
          <div className="lg:w-1/3 overflow-auto">
            <UnreportedExpensesView compact={true} />
          </div>
          {/* Detail section - takes 2/3 of the space on desktop */}
          <div className="lg:w-2/3 border-l lg:pl-4">{children}</div>
        </>
      ) : (
        <div className="w-full h-[calc(100vh-10rem)] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
