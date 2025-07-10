"use client";

import * as React from "react";
import { useState } from "react";
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
}

export default function AddReportDialog({
  open,
  onOpenChange,
}: AddReportDialogProps) {
  const [reportName, setReportName] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSave = () => {
    // Handle save logic here
    console.log({
      reportName,
      businessPurpose,
      startDate,
      endDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Report
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

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

        <DialogFooter className="justify-end border-t pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
