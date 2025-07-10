"use client";

import * as React from "react";
import { useState } from "react";
import { X, CalendarIcon, FileText, Image, File } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

// Define the form schema with Zod
const expenseFormSchema = z.object({
  report: z.string().min(1, { message: "Report is required" }),
  date: z.date(),
  merchant: z.string().min(1, { message: "Merchant is required" }),
  category: z.string().min(1, { message: "Please select a category" }),
  currency: z.string(),
  amount: z
    .number()
    .min(0.01, { message: "Amount must be greater than 0" })
    .nonnegative({ message: "Amount cannot be negative" }),
  claimReimbursement: z.boolean(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

// Infer the type from the schema
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface AddNewExpenseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewExpense({ isOpen, onClose }: AddNewExpenseProps) {
  const [files, setFiles] = useState<File[]>([]);

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      report: "",
      date: new Date(),
      merchant: "",
      category: "",
      currency: "INR",
      amount: 0,
      claimReimbursement: true,
      description: "",
      reference: "",
    },
    mode: "onChange",
  });

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const onSubmit = form.handleSubmit((values) => {
    console.log(values);
    onClose();
  });

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
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Report Input */}
                  <FormField
                    control={form.control}
                    name="report"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter report name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expense Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expense Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Merchant Input */}
                  <FormField
                    control={form.control}
                    name="merchant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merchant *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter merchant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="meals">
                              Meals & Entertainment
                            </SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="office">
                              Office Supplies
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <div className="grid grid-cols-4 gap-2">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem className="flex flex-col ">
                          <FormLabel className="">Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "INR"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({
                        field: { value, onChange, ...fieldProps },
                      }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>Amount *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              value={value || ""}
                              onChange={(e) =>
                                onChange(e.target.valueAsNumber || 0)
                              }
                              {...fieldProps}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Claim Reimbursement */}
                  <FormField
                    control={form.control}
                    name="claimReimbursement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Claim reimbursement</FormLabel>
                          <FormDescription>
                            Check this if you want to claim reimbursement for
                            this expense
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter expense description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reference */}
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter reference number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">Save and Close</Button>
                  </div>
                </form>
              </Form>
            </div>

            <div className="md:col-span-2 h-full">
              <div className="flex flex-col h-full space-y-4">
                <h3 className="text-lg font-medium">Attach Receipt</h3>
                <div className="relative flex-1 flex flex-col">
                  <DropZone
                    className="flex-1 h-full pb-[140px] sm:pb-[100px]"
                    onFilesDrop={handleFilesDrop}
                    title="Drag and drop receipt here"
                    description="Supports JPG, PNG, and PDF files"
                    buttonText="Browse Files"
                  />

                  {files.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg  h-[120px]">
                      <div className="flex items-center justify-between sticky top-0 bg-white/90 z-10">
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
                      <div className="flex flex-wrap gap-2 pb-2 pt-2">
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
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-red-500 group-hover:opacity-100 transition-opacity"
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
