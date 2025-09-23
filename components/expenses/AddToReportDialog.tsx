"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Loader, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Report {
  id: string;
  title: string;
}

interface AddToReportDialogProps {
  expenseId?: string | number;
  expenseIds?: Array<string | number>;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToReportDialog({
  expenseId,
  expenseIds,
  isOpen,
  onClose,
}: AddToReportDialogProps) {
  const router = useRouter();
  const [isAddingToReport, setIsAddingToReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReportTitle, setSelectedReportTitle] = useState<string>("");

  // --- NEW: State and Ref for dropdown control ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch reports when the search query changes
  useEffect(() => {
    // --- UPDATED: More robust conditions to fetch ---
    if (!debouncedSearchQuery || debouncedSearchQuery === selectedReportTitle) {
      setReports([]);
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/reports/search?query=${encodeURIComponent(
            debouncedSearchQuery
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        const reportsArray = Array.isArray(data) ? data : data.data || [];
        const mappedReports = reportsArray.map((report: any) => ({
          id: report.id.toString(),
          title: report.title,
        }));
        setReports(mappedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [debouncedSearchQuery, selectedReportTitle]); // Dependency on selectedReportTitle prevents re-fetch on selection

  // --- NEW: Effect to handle clicks outside the search container ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset all state when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setReports([]);
      setSelectedReportId(null);
      setSelectedReportTitle("");
      setIsDropdownOpen(false);
      setIsAddingToReport(false);
    }
  }, [isOpen]);

  const handleAddToReport = async () => {
    if (!selectedReportId) {
      toast.error("Please select a report");
      return;
    }

    setIsAddingToReport(true);
    try {
      // Handle bulk update if expenseIds is provided
      if (expenseIds && expenseIds.length > 0) {
        const response = await fetch(`/api/expenses/bulk-update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expenseIds: expenseIds,
            reportId: parseInt(selectedReportId, 10),
          }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const count = expenseIds.length;
        toast.success(
          `${count} expense${
            count !== 1 ? "s" : ""
          } added to report: ${selectedReportTitle}`
        );
      }
      // Handle single expense update
      else if (expenseId) {
        const response = await fetch(`/api/expenses/${expenseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: parseInt(selectedReportId, 10),
          }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        toast.success(`Expense added to report: ${selectedReportTitle}`);
      }

      onClose(); // This will trigger the state reset via the useEffect above
      router.refresh();
    } catch (error) {
      console.error("Failed to add expense(s) to report:", error);
      toast.error("Failed to add expense(s) to report");
    } finally {
      setIsAddingToReport(false);
    }
  };

  // --- UPDATED: handleSelectReport now controls the input and dropdown ---
  const handleSelectReport = (report: Report) => {
    setSelectedReportId(report.id);
    setSelectedReportTitle(report.title);
    setSearchQuery(report.title); // Set input text to the selected report's title
    setIsDropdownOpen(false); // Close the dropdown on selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Report</DialogTitle>
          <DialogDescription>
            {expenseIds && expenseIds.length > 0
              ? `Select a report to add ${expenseIds.length} expense${
                  expenseIds.length !== 1 ? "s" : ""
                } to.`
              : "Select a report to add this expense to."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* --- UPDATED: Wrapped in a div with a ref for click-outside detection --- */}
          <div className="relative" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <Input
              type="text"
              placeholder="Search reports..."
              className="pl-10"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // --- NEW: If user starts typing again, clear the previous selection ---
                if (selectedReportId) {
                  setSelectedReportId(null);
                  setSelectedReportTitle("");
                }
                setIsDropdownOpen(true);
              }}
            />

            {/* --- UPDATED: Dropdown is now conditionally rendered --- */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full z-10 border rounded-md bg-white shadow-lg max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading reports...</span>
                    </div>
                  </div>
                ) : reports.length === 0 && debouncedSearchQuery ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No reports found
                  </div>
                ) : reports.length > 0 ? (
                  <div className="divide-y">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectReport(report)}
                      >
                        {report.title}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToReport}
            disabled={isAddingToReport || !selectedReportId}
          >
            {isAddingToReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-white" />
                Adding...
              </>
            ) : (
              "Add to Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
