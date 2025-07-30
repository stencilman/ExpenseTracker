"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Search, Loader } from "lucide-react";

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

interface AddToReportDialogProps {
  expenseId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToReportDialog({
  expenseId,
  isOpen,
  onClose,
}: AddToReportDialogProps) {
  const router = useRouter();
  const [isAddingToReport, setIsAddingToReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<{ id: string; title: string }[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReportTitle, setSelectedReportTitle] = useState<string>("");

  // Fetch reports when the dialog is open and the search query changes
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    console.log("Dialog is open, fetching reports...");
    
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearchQuery) {
          params.append("query", debouncedSearchQuery);
        }
        
        console.log(`Fetching from: /api/reports/search?${params.toString()}`);
        const response = await fetch(`/api/reports/search?${params.toString()}`);
        
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();
        console.log("API Response:", data);
        
        const reportsArray = Array.isArray(data) ? data : data.data || [];
        console.log("Reports array to use:", reportsArray);
        
        const mappedReports = reportsArray.map((report: any) => ({
          id: report.id.toString(),
          title: report.title,
        }));
        
        console.log("Mapped reports to set in state:", mappedReports);
        setReports(mappedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [isOpen, debouncedSearchQuery]);

  // Reset state when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setReports([]);
      setSearchQuery("");
      setSelectedReportId(null);
      setSelectedReportTitle("");
    }
  }, [isOpen]);

  const handleAddToReport = async () => {
    if (!selectedReportId) {
      toast.error("Please select a report");
      return;
    }

    setIsAddingToReport(true);
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: parseInt(selectedReportId),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast.success(`Expense added to report: ${selectedReportTitle}`);
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to add expense to report:", error);
      toast.error("Failed to add expense to report");
    } finally {
      setIsAddingToReport(false);
    }
  };

  // Debug render - log component state
  console.log("Rendering AddToReportDialog with state:", {
    isOpen,
    reports: reports.length,
    isLoading,
    selectedReportId,
    selectedReportTitle,
  });

  const handleSelectReport = (reportId: string, reportTitle: string) => {
    console.log("Selecting report:", reportId, reportTitle);
    setSelectedReportId(reportId);
    setSelectedReportTitle(reportTitle);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Report</DialogTitle>
          <DialogDescription>
            Select a report to add this expense to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <Input
              type="text"
              placeholder="Search reports..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md max-h-[200px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                <span>Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No reports found
              </div>
            ) : (
              <div className="divide-y">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedReportId === report.id ? 'bg-gray-100' : ''}`}
                    onClick={() => handleSelectReport(report.id, report.title)}
                  >
                    {report.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToReport}
            disabled={isAddingToReport || !selectedReportId}
          >
            {isAddingToReport ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
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
