"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";

export default function AdminReportsReimbursedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/reports/reimbursed');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <ReportsTable
      data={reports}
      enableRowSelection={true}
      onSelectedRowsChange={handleSelectedRowsChange}
      showPagination={true}
      variant="page"
    />
  );
}
