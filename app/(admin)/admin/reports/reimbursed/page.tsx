"use client";

import { ReportsFilterBar } from "@/components/admin/reports/ReportsFilterBar";
import { ReportsTable } from "@/components/table/ReportsTable";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { REPORTS_PAGE_SIZE, useAdminReports } from "@/hooks/use-admin-reports";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export default function AdminReportsReimbursedPage() {
  const {
    reports,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    queryString,
  } = useAdminReports({ endpoint: "/api/admin/reports/reimbursed" });

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      <ReportsFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        dateLabel="Reimbursed"
        exportScope="reimbursed"
        exportQuery={queryString}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <ReportsTable
          data={reports}
          showPagination={false} /* Disable built-in pagination */
          pageSize={REPORTS_PAGE_SIZE}
          variant="page"
        />
      )}

      {/* Custom server-side pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
