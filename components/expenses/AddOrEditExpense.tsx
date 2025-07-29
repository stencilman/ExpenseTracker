"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useExpenses } from "../providers/ExpenseProvider";
import {
  X,
  CalendarIcon,
  FileText,
  Image,
  File,
  Download,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DropZone } from "@/components/ui/drop-zone";
import { ExpenseCategory } from "@prisma/client";
import { ExpenseWithUI } from "@/types/expense"; // Assuming this type is available
import { useDebounce } from "@/lib/hooks/use-debounce";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Loader } from "@/components/ui/loader";

// Define a unified form schema with Zod for both add and edit modes
const expenseFormSchema = z.object({
  report: z.string().optional(), // Only for 'add' mode UI, not a core expense field
  date: z.date().refine((val) => val instanceof Date, {
    message: "A date is required.",
  }),
  merchant: z.string().min(1, { message: "Merchant is required" }),
  category: z.enum(
    Object.values(ExpenseCategory) as [ExpenseCategory, ...ExpenseCategory[]]
  ),
  currency: z.string(),
  amount: z.coerce // Use coerce to handle string from input and convert to number
    .number()
    .min(0.01, { message: "Amount must be greater than 0" })
    .nonnegative({ message: "Amount cannot be negative" }),
  claimReimbursement: z.boolean(),
  description: z.string().optional(),
  reference: z.string().optional(), // This will map to the 'notes' field in the database
});

// Infer the type from the schema
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface AddOrEditExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: ExpenseWithUI; // Optional: if provided, we're in edit mode
  mode: "add" | "edit";
  initialFiles?: File[]; // Optional: initial files to populate the dropzone
}

// Interface for existing receipts from the server
interface ExistingReceipt {
  url: string;
  name: string;
  isPdf: boolean;
}

export default function AddOrEditExpense({
  isOpen,
  onClose,
  expense,
  mode,
  initialFiles = [],
}: AddOrEditExpenseProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [existingReceipts, setExistingReceipts] = useState<ExistingReceipt[]>(
    []
  );
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [initialFormValues, setInitialFormValues] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [reports, setReports] = useState<{ id: number; title: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedReportTitle, setSelectedReportTitle] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { createExpense, updateExpense, isLoading } = useExpenses();
  const isEditMode = mode === "edit" && expense;

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/expenses/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Could not load expense categories.");
      }
    };
    fetchCategories();
  }, []);

  // Search for reports based on the debounced search term
  useEffect(() => {
    const searchReports = async () => {
      if (!debouncedSearchTerm) {
        setReports([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/reports/search?query=${encodeURIComponent(debouncedSearchTerm)}`
        );
        if (!response.ok) throw new Error("Failed to search reports");
        const data = await response.json();
        setReports(data.data || []);
      } catch (error) {
        console.error("Error searching reports:", error);
        toast.error("Could not search for reports.");
      } finally {
        setIsSearching(false);
      }
    };

    searchReports();
  }, [debouncedSearchTerm]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as any, // Type assertion to fix resolver compatibility
    defaultValues: {
      report: "",
      date: new Date(),
      merchant: "",
      category: ExpenseCategory.OTHER,
      currency: "INR",
      amount: 0,
      claimReimbursement: true,
      description: "",
      reference: "",
    },
    mode: "onChange",
  });

  // Effect to reset form state when the drawer opens or the mode changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Create the initial form values object
        const initialValues = {
          date: new Date(expense.date),
          merchant: expense.merchant,
          category: expense.category,
          amount: expense.amount,
          description: expense.description || "",
          reference: expense.notes || "",
          // Fields not typically edited but kept for schema validity
          currency: (expense as any).currency || "INR",
          report: expense.reportId ? expense.reportId.toString() : "",
          claimReimbursement: (expense as any).claimReimbursement ?? true,
        };

        // If there's a reportId, fetch the report details to display the title
        if (expense.reportId) {
          const fetchReportDetails = async () => {
            try {
              const response = await fetch(`/api/reports/${expense.reportId}`);
              if (response.ok) {
                const reportData = await response.json();
                setSelectedReportTitle(reportData.title);
                console.log("Loaded report title:", reportData.title);
              }
            } catch (error) {
              console.error("Failed to fetch report details:", error);
            }
          };
          fetchReportDetails();
        }

        // Store the initial values for comparison
        setInitialFormValues(initialValues);

        // Reset the form with these values
        form.reset(initialValues);

        // Process existing receipt URLs if available
        if (expense.receiptUrls && expense.receiptUrls.length > 0) {
          const receipts = expense.receiptUrls.map((url, index) => {
            // Extract filename from URL or use a default name
            const urlParts = url.split("/");
            const fileName =
              urlParts[urlParts.length - 1] || `receipt-${index + 1}`;

            // Improved PDF detection logic
            // Check both filename extension and URL for PDF indicators
            const isPdf =
              fileName.toLowerCase().endsWith(".pdf") ||
              url.toLowerCase().includes("pdf") ||
              url.toLowerCase().includes("application/pdf");

            return {
              url,
              name: fileName,
              isPdf,
            };
          });
          setExistingReceipts(receipts);
        } else {
          setExistingReceipts([]);
        }

        // Reset the hasChanges flag
        setHasChanges(false);
      } else {
        // Reset form to default values for adding a new expense
        const defaultValues = {
          report: "",
          date: new Date(),
          merchant: "",
          category:
            categories.length > 0 ? categories[0] : ExpenseCategory.OTHER,
          currency: "INR",
          amount: 0,
          claimReimbursement: true,
          description: "",
          reference: "",
        };

        form.reset(defaultValues);
        setInitialFormValues(null); // No initial values in add mode
        setExistingReceipts([]);
        setHasChanges(false); // Reset changes flag
      }
    }
  }, [isOpen, isEditMode, expense, form, categories]);

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...newFiles];
      // Mark as changed if we have files in edit mode
      if (isEditMode) setHasChanges(true);
      return updatedFiles;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      // Mark as changed if we're in edit mode
      if (isEditMode) setHasChanges(true);
      return updatedFiles;
    });
  };

  const removeExistingReceipt = async (index: number) => {
    try {
      const receiptToRemove = existingReceipts[index];
      if (receiptToRemove) {
        // Extract the key from the URL
        const urlParts = receiptToRemove.url.split("/");
        const key = urlParts[urlParts.length - 1];

        // Call the API to delete the file from S3
        const response = await fetch("/api/uploads/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: receiptToRemove.url }),
        });

        if (!response.ok) {
          console.error(
            "Failed to delete file from S3:",
            await response.text()
          );
          // Continue with UI removal even if S3 deletion fails
        }
      }

      // Update the UI state
      setExistingReceipts((prevReceipts) => {
        const updatedReceipts = prevReceipts.filter((_, i) => i !== index);
        // Always mark as changed when removing existing receipts
        if (isEditMode) setHasChanges(true);
        return updatedReceipts;
      });
    } catch (error) {
      console.error("Error removing receipt:", error);
      toast.error("Failed to remove receipt. Please try again.");
    }
  };

  // Helper function to get proxy URL for S3 files
  const getProxyUrl = useCallback((url: string) => {
    if (!url) return "";
    // If it's already a proxy URL, return as is
    if (url.includes("/api/files/")) return url;

    // Extract the key from the S3 URL
    const urlParts = url.split("/");
    const key = urlParts[urlParts.length - 1];

    // Return the proxy URL
    return `/api/files/${key}`;
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Format the data payload for the API
      const expenseData: {
        amount: number;
        date: string;
        description: string;
        merchant: string;
        category: ExpenseCategory;
        notes: string;
        claimReimbursement: boolean;
        receiptUrls?: string[];
        reportId?: number;
      } = {
        amount: values.amount,
        date: format(values.date, "yyyy-MM-dd"), // Format as YYYY-MM-DD
        description: values.description || "", // Use merchant as fallback
        merchant: values.merchant,
        category: values.category,
        notes: values.reference || "",
        claimReimbursement: values.claimReimbursement,
      };

      // Add reportId if a report was selected
      if (values.report) {
        expenseData.reportId = parseInt(values.report, 10);
      }

      // Combine existing receipts (that weren't removed) with new uploads
      let receiptUrls: string[] = existingReceipts.map(
        (receipt) => receipt.url
      );

      // Upload new receipts to S3 if there are any files
      if (files.length > 0) {
        // Upload each file and collect the URLs
        for (const file of files) {
          // Create a FormData object to send the file
          const formData = new FormData();
          formData.append("file", file);

          // Upload the file to S3 via our API
          const uploadResponse = await fetch("/api/uploads", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(
              `Failed to upload receipt: ${uploadResponse.statusText}`
            );
          }

          const uploadResult = await uploadResponse.json();
          receiptUrls.push(uploadResult.url);
        }
      }

      // Add the receipt URLs to the expense data
      expenseData.receiptUrls = receiptUrls;

      // Log the final payload for debugging
      console.log("Final expense payload:", expenseData);

      if (isEditMode) {
        // Make sure reportId is explicitly included in the payload
        if (values.report) {
          console.log("Updating expense with reportId:", expenseData.reportId);
        } else {
          // Explicitly set reportId to null to clear any existing association
          // Use undefined instead of null to match the type definition
          expenseData.reportId = undefined;
          console.log(
            "Explicitly setting reportId to undefined in update payload"
          );
        }

        await updateExpense(expense.id.toString(), expenseData);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense({ ...expenseData, status: "UNREPORTED" });
        toast.success("Expense created successfully!");
      }

      onClose(); // Close the drawer on success
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(
        isEditMode ? "Failed to update expense" : "Failed to create expense"
      );
    }
  });

  const handleClose = () => {
    form.reset();
    setFiles([]);
    setExistingReceipts([]);
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <Image className="h-6 w-6 text-blue-500" />;
    if (file.type === "application/pdf")
      return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const getFilePreview = (file: File): string | null => {
    return file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
  };

  // Watch form values to detect changes
  const formValues = form.watch();

  // Effect to detect changes in form values
  useEffect(() => {
    if (isEditMode && initialFormValues) {
      // Compare current form values with initial values
      const formChanged = Object.keys(initialFormValues).some((key) => {
        // Special handling for date comparison
        if (key === "date") {
          const initialDate = new Date(initialFormValues.date).toDateString();
          const currentDate = new Date(formValues.date).toDateString();
          return initialDate !== currentDate;
        }

        // Type-safe comparison for specific fields
        switch (key) {
          case "merchant":
            return initialFormValues.merchant !== formValues.merchant;
          case "category":
            return initialFormValues.category !== formValues.category;
          case "amount":
            return initialFormValues.amount !== formValues.amount;
          case "description":
            return initialFormValues.description !== formValues.description;
          case "reference":
            return initialFormValues.reference !== formValues.reference;
          case "currency":
            return initialFormValues.currency !== formValues.currency;
          case "report":
            return initialFormValues.report !== formValues.report;
          case "claimReimbursement":
            return (
              initialFormValues.claimReimbursement !==
              formValues.claimReimbursement
            );
          default:
            return false;
        }
      });

      // Check if files or receipts have changed
      const filesChanged = files.length > 0;
      const receiptsChanged =
        existingReceipts.length !== (expense?.receiptUrls?.length || 0);

      // Update the hasChanges state
      setHasChanges(formChanged || filesChanged || receiptsChanged);
    }
  }, [
    formValues,
    files,
    existingReceipts,
    isEditMode,
    initialFormValues,
    expense,
  ]);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-[95vh] max-h-[95vh] !mt-0 !max-h-[95vh]">
        <DrawerHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              {isEditMode ? "Edit Expense" : "Add Expense"}
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
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Form Fields Column */}
              <div className="md:col-span-1 space-y-4">
                {/* Report Input - available in both add and edit modes */}
                <FormField
                  control={form.control}
                  name="report"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Report</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? selectedReportTitle ||
                                  reports.find(
                                    (report) =>
                                      report.id.toString() === field.value
                                  )?.title ||
                                  "Report #" + field.value
                                : "Select a report"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search for reports..."
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isSearching ? (
                                  <div className="py-6 text-center text-sm">
                                    <Loader
                                      size="sm"
                                      className="mx-auto mb-2"
                                    />
                                    Searching...
                                  </div>
                                ) : (
                                  "No reports found."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {reports.map((report) => (
                                  <CommandItem
                                    key={report.id}
                                    value={report.title}
                                    onSelect={() => {
                                      console.log("Selected report:", report);
                                      form.setValue(
                                        "report",
                                        report.id.toString()
                                      );
                                      // Store the selected report title
                                      setSelectedReportTitle(report.title);
                                      setSearchTerm("");
                                      // Close the popover after selection
                                      document.body.click();
                                    }}
                                  >
                                    {report.title}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Search and select a report to attach this expense to.
                      </FormDescription>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
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
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!isEditMode}
                        >
                          {" "}
                          {/* FIX: Coerce to boolean */}
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
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Claim Reimbursement - available in both add and edit modes */}
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
                          Check this if you want to claim reimbursement for this expense.
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
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* FIX: Removed stray closing tag `/>` from here */}

                {/* Reference */}
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference / Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Invoice #, Confirmation ID"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* FIX: Added missing self-closing tag `/>` */}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || (isEditMode && !hasChanges)}
                  >
                    {isLoading ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : isEditMode ? (
                      "Update Expense"
                    ) : (
                      "Save Expense"
                    )}
                  </Button>
                </div>
              </div>

              {/* Attachments Column */}
              <div className="md:col-span-2 h-full">
                <div className="flex flex-col h-full space-y-4">
                  <h3 className="text-lg font-medium">Attach Receipt</h3>
                  <div className="relative flex-1 flex flex-col">
                    <DropZone
                      className="flex-1 h-full pb-[140px] sm:pb-[100px]"
                      onFilesDrop={handleFilesDrop}
                    />
                    {(files.length > 0 || existingReceipts.length > 0) && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg h-[120px]">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Receipts ({files.length + existingReceipts.length})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setFiles([]);
                              setExistingReceipts([]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2 pb-2 pt-2 overflow-x-auto">
                          {/* Existing receipts */}
                          {existingReceipts.map((receipt, index) => {
                            const proxyUrl = getProxyUrl(receipt.url);
                            return (
                              <div
                                key={`existing-${index}`}
                                className="relative flex-shrink-0 group"
                              >
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                                  {!receipt.isPdf ? (
                                    <img
                                      src={proxyUrl}
                                      alt={receipt.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-1">
                                      <FileText className="h-6 w-6 text-red-500" />
                                      <span className="text-xs mt-1 text-gray-600 truncate w-12 text-center">
                                        PDF
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100"
                                  onClick={() => removeExistingReceipt(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                                  Receipt #{index + 1}
                                </div>
                              </div>
                            );
                          })}

                          {/* New files */}
                          {files.map((file, index) => {
                            const previewUrl = getFilePreview(file);
                            return (
                              <div
                                key={`new-${index}`}
                                className="relative flex-shrink-0 group"
                              >
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-green-200 flex items-center justify-center overflow-hidden">
                                  {previewUrl ? (
                                    <img
                                      src={previewUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-1">
                                      {getFileIcon(file)}
                                      <span className="text-xs mt-1 text-gray-600 truncate w-12 text-center">
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                                  {file.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
