"use client";

import * as React from "react";
import { useState } from "react";
import { X, CalendarIcon, FileText, Image, File } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DropZone } from "@/components/ui/drop-zone";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface AddNewExpenseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewExpense({ isOpen, onClose }: AddNewExpenseProps) {
  const [activeTab, setActiveTab] = useState("add-expense");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [claimReimbursement, setClaimReimbursement] = useState(true);

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getFilePreview = (file: File): string | null => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[95vh] max-h-[95vh] !mt-0 !max-h-[95vh]">
        <DrawerHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              Add Expense
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Report Selection */}
                <div className="space-y-2">
                  <Label htmlFor="report">Report</Label>
                  <Select>
                    <SelectTrigger id="report">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="report1">Q2 Travel Report</SelectItem>
                      <SelectItem value="report2">Office Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expense Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Expense Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Merchant */}
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant *</Label>
                  <Select>
                    <SelectTrigger id="merchant">
                      <SelectValue placeholder="Select or type to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="uber">Uber</SelectItem>
                      <SelectItem value="starbucks">Starbucks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meals">
                        Meals & Entertainment
                      </SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="flex">
                    <Select defaultValue="INR">
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="INR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="flex-1 ml-2"
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Itemize
                    </Button>
                  </div>
                </div>

                {/* Claim Reimbursement */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reimbursement"
                    checked={claimReimbursement}
                    onCheckedChange={(checked) =>
                      setClaimReimbursement(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="reimbursement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Claim reimbursement
                  </Label>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense description"
                  />
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="Enter reference number" />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Save and Close</Button>
                </div>
              </form>
            </div>

            <div className="md:col-span-2 h-full">
              <div className="flex flex-col h-full space-y-4">
                <h3 className="text-lg font-medium">Attach Receipt</h3>
                <div className="relative flex-1 flex flex-col">
                  <DropZone
                    className="flex-1 h-full"
                    onFilesDrop={handleFilesDrop}
                    title="Drag and drop receipt here"
                    description="Supports JPG, PNG, and PDF files"
                    buttonText="Browse Files"
                  />

                  {files.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">
                          Uploaded Files ({files.length})
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500"
                          onClick={() => setFiles([])}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="relative flex-shrink-0 group"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                              {file.type.startsWith("image/") ? (
                                (() => {
                                  const previewUrl = getFilePreview(file);
                                  return previewUrl ? (
                                    <img
                                      src={previewUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center">
                                      {getFileIcon(file)}
                                      <span className="text-xs mt-1 text-gray-600 truncate w-12 text-center">
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase()}
                                      </span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  {getFileIcon(file)}
                                  <span className="text-xs mt-1 text-gray-600 truncate w-12 text-center">
                                    {file.name.split(".").pop()?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
