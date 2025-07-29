"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportAdded?: () => void;
  mode?: 'add' | 'edit';
  reportId?: number;
  onReportUpdated?: () => void;
}

export default function AddReportDialog({
  open,
  onOpenChange,
  onReportAdded,
  mode = 'add',
  reportId,
  onReportUpdated,
}: AddReportDialogProps) {
  const [reportName, setReportName] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch report data when in edit mode
  useEffect(() => {
    const fetchReportData = async () => {
      if (mode === 'edit' && reportId && open) {
        setIsLoading(true);
        setError("");
        
        try {
          const response = await fetch(`/api/reports/${reportId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch report data");
          }
          
          const reportData = await response.json();
          
          // Pre-populate form fields
          setReportName(reportData.title || "");
          setBusinessPurpose(reportData.description || "");
          
          // Convert ISO date strings to Date objects if they exist
          if (reportData.startDate) {
            setStartDate(new Date(reportData.startDate));
          }
          
          if (reportData.endDate) {
            setEndDate(new Date(reportData.endDate));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchReportData();
  }, [mode, reportId, open]);

  const handleSave = async () => {
    if (!reportName.trim()) {
      setError("Report name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const isEditMode = mode === 'edit' && reportId;
      const url = isEditMode ? `/api/reports/${reportId}` : "/api/reports";
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: reportName,
          description: businessPurpose,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} report`);
      }

      // Close the dialog on success
      onOpenChange(false);
      
      // Reset form fields
      setReportName("");
      setBusinessPurpose("");
      setStartDate(undefined);
      setEndDate(undefined);
      
      // Call the appropriate callback if provided
      if (isEditMode && onReportUpdated) {
        onReportUpdated();
      } else if (!isEditMode && onReportAdded) {
        onReportAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Report' : 'New Report'}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <Loader size="md" text="Loading report data..." />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="reportName" className="text-sm font-medium">
              Report Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="reportName"
              placeholder="eg: Trip to New York"
              value={reportName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReportName(e.target.value)
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="businessPurpose" className="text-sm font-medium">
              Business Purpose
            </label>
            <Textarea
              id="businessPurpose"
              placeholder="Max 500 characters"
              value={businessPurpose}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBusinessPurpose(e.target.value)
              }
              className="resize-none"
              maxLength={500}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Duration</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate
                        ? format(startDate, "dd/MM/yyyy")
                        : "eg: 31/01/2020"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate
                        ? format(endDate, "dd/MM/yyyy")
                        : "eg: 31/01/2020"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        )}

        {error && (
          <div className="text-sm text-red-500 mt-2">{error}</div>
        )}

        <DialogFooter className="justify-end border-t pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <>
                <Loader size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              mode === 'edit' ? "Update" : "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
