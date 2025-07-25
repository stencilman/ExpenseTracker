"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useExpenses } from "../providers/ExpenseProvider";
import { X, CalendarIcon, FileText, Image, File } from "lucide-react";
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
}

export default function AddOrEditExpense({
  isOpen,
  onClose,
  expense,
  mode,
}: AddOrEditExpenseProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
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
        // Populate form with existing expense data for editing
        form.reset({
          date: new Date(expense.date),
          merchant: expense.merchant,
          category: expense.category,
          amount: expense.amount,
          description: expense.description || "",
          reference: expense.notes || "",
          // Fields not typically edited but kept for schema validity
          currency: (expense as any).currency || "INR",
          report: (expense as any).report || "",
          claimReimbursement: (expense as any).claimReimbursement ?? true,
        });
      } else {
        // Reset form to default values for adding a new expense
        form.reset({
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
        });
      }
    }
  }, [isOpen, isEditMode, expense, form, categories]);

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Format the data payload for the API
      const expenseData = {
        amount: values.amount,
        date: format(values.date, "yyyy-MM-dd"), // Format as YYYY-MM-DD
        description: values.description || "", // Use merchant as fallback
        merchant: values.merchant,
        category: values.category,
        notes: values.reference || "",
      };

      if (isEditMode) {
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

                {/* Claim Reimbursement - only for 'add' mode */}
                {!isEditMode && (
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
                            Check this to claim reimbursement.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? "Saving..."
                      : isEditMode
                      ? "Update Expense"
                      : "Save Expense"}
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
                    {files.length > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg h-[120px]">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Uploaded Files ({files.length})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setFiles([])}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2 pb-2 pt-2 overflow-x-auto">
                          {files.map((file, index) => {
                            const previewUrl = getFilePreview(file);
                            return (
                              <div
                                key={index}
                                className="relative flex-shrink-0 group"
                              >
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 flex items-center justify-center overflow-hidden">
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
