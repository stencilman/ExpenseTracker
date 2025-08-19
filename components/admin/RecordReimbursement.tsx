"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/format-utils";

interface RecordReimbursementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ReimbursementFormValues) => void;
  reportId?: string;
  totalAmount?: number;
  totalAdvance?: number;
}

// Define the form schema with Zod
const formSchema = z.object({
  date: z.string().min(1, { message: "Reimbursement date is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

type ReimbursementFormValues = z.infer<typeof formSchema>;

export default function RecordReimbursement({
  open,
  onOpenChange,
  onConfirm,
  reportId,
  totalAmount = 944.0,
  totalAdvance = 0.0,
}: RecordReimbursementProps) {
  // Initialize react-hook-form
  const form = useForm<ReimbursementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "bank_transfer",
      notes: "",
      reference: "",
    },
  });

  const handleSubmit = (data: ReimbursementFormValues) => {
    onConfirm(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] sm:max-h-none max-h-[90vh] sm:overflow-visible overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-gray-400" />
            <DialogTitle className="text-xl">Record Reimbursement</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 md:space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 md:mb-4">
                    Manual Reimbursement
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount to be Reimbursed</Label>
                      <Input
                        id="amount"
                        value={formatCurrency(totalAmount - totalAdvance)}
                        className="bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="flex items-center">
                            Reimbursed on{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={
                                    field.value
                                      ? "w-full justify-start text-left font-normal"
                                      : "w-full justify-start text-left font-normal text-muted-foreground"
                                  }
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "dd/MM/yyyy")
                                  ) : (
                                    "Select date"
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(format(date, "yyyy-MM-dd"));
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Paid Through</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="petty_cash">
                                Petty Cash
                              </SelectItem>
                              <SelectItem value="undeposited_funds">
                                Undeposited Funds
                              </SelectItem>
                              <SelectItem value="bank_transfer">
                                Bank Transfer
                              </SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              className="bg-white resize-none h-16 md:h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Reference #</FormLabel>
                          <FormControl>
                            <Input className="bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 md:mb-4">
                    REIMBURSEMENT SUMMARY
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Total Reimbursable Amount
                      </span>
                      <span className="font-medium">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Advance</span>
                      <span className="font-medium flex items-center">
                        <span className="text-gray-400 mr-1">−</span> 
                        {formatCurrency(totalAdvance)}
                      </span>
                    </div>

                    <div className="mt-4 md:mt-6 bg-green-50 p-3 md:p-4 rounded-md">
                      <div className="flex justify-between items-center text-green-700">
                        <span className="font-medium">
                          Amount to be Reimbursed
                        </span>
                        <span className="font-medium">
                          {formatCurrency(totalAmount - totalAdvance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 md:mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Record Reimbursement</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
