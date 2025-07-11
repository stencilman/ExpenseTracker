import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type FilterOptions = {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  amountRange?: {
    min: number | undefined;
    max: number | undefined;
  };
  categories?: string[];
  merchants?: string[];
  status?: string[];
};

interface ExpensesFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  merchants: string[];
  statuses: string[];
}

export function ExpensesFilter({
  onFilterChange,
  categories,
  merchants,
  statuses,
}: ExpensesFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterOptions>({
    dateRange: undefined,
    amountRange: undefined,
    categories: [],
    merchants: [],
    status: [],
  });

  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [amountRange, setAmountRange] = React.useState<{
    min: string;
    max: string;
  }>({
    min: "",
    max: "",
  });

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [selectedMerchants, setSelectedMerchants] = React.useState<string[]>(
    []
  );
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const handleApplyFilters = () => {
    const newFilters: FilterOptions = {
      dateRange: dateRange.from ? dateRange : undefined,
      amountRange:
        amountRange.min || amountRange.max
          ? {
              min: amountRange.min ? parseFloat(amountRange.min) : undefined,
              max: amountRange.max ? parseFloat(amountRange.max) : undefined,
            }
          : undefined,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      merchants: selectedMerchants.length > 0 ? selectedMerchants : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setAmountRange({ min: "", max: "" });
    setSelectedCategories([]);
    setSelectedMerchants([]);
    setSelectedStatuses([]);

    const emptyFilters: FilterOptions = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.amountRange) count++;
    if (filters.categories?.length) count++;
    if (filters.merchants?.length) count++;
    if (filters.status?.length) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          Filter
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Expenses</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Date Range Filter */}
          <div className="grid gap-2">
            <Label>Date Range</Label>
            <div className="flex flex-col space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP")} -{" "}
                          {format(dateRange.to, "PPP")}
                        </>
                      ) : (
                        format(dateRange.from, "PPP")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange({
                          from: range.from,
                          to: range.to || range.from,
                        });
                      } else {
                        setDateRange({ from: undefined, to: undefined });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Amount Range Filter */}
          <div className="grid gap-2">
            <Label>Amount Range</Label>
            <div className="flex gap-2">
              <div className="grid gap-1">
                <Label htmlFor="min-amount" className="text-xs">
                  Min
                </Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="Min"
                  value={amountRange.min}
                  onChange={(e) =>
                    setAmountRange({ ...amountRange, min: e.target.value })
                  }
                  className="h-8"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="max-amount" className="text-xs">
                  Max
                </Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder="Max"
                  value={amountRange.max}
                  onChange={(e) =>
                    setAmountRange({ ...amountRange, max: e.target.value })
                  }
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Category Filter */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !selectedCategories.length && "text-muted-foreground"
                  )}
                >
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : "Select categories"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1.5 text-sm cursor-pointer"
                      onClick={() => {
                        setSelectedCategories((prev) => {
                          const isSelected = prev.includes(category);
                          if (isSelected) {
                            return prev.filter((c) => c !== category);
                          } else {
                            return [...prev, category];
                          }
                        });
                      }}
                    >
                      <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                        {selectedCategories.includes(category) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Merchant Filter */}
          <div className="grid gap-2">
            <Label>Merchant</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !selectedMerchants.length && "text-muted-foreground"
                  )}
                >
                  {selectedMerchants.length > 0
                    ? `${selectedMerchants.length} selected`
                    : "Select merchants"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2">
                  {merchants.map((merchant) => (
                    <div
                      key={merchant}
                      className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1.5 text-sm cursor-pointer"
                      onClick={() => {
                        setSelectedMerchants((prev) => {
                          const isSelected = prev.includes(merchant);
                          if (isSelected) {
                            return prev.filter((m) => m !== merchant);
                          } else {
                            return [...prev, merchant];
                          }
                        });
                      }}
                    >
                      <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                        {selectedMerchants.includes(merchant) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span>{merchant}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !selectedStatuses.length && "text-muted-foreground"
                  )}
                >
                  {selectedStatuses.length > 0
                    ? `${selectedStatuses.length} selected`
                    : "Select statuses"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2">
                  {statuses.map((status) => (
                    <div
                      key={status}
                      className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1.5 text-sm cursor-pointer"
                      onClick={() => {
                        setSelectedStatuses((prev) => {
                          const isSelected = prev.includes(status);
                          if (isSelected) {
                            return prev.filter((s) => s !== status);
                          } else {
                            return [...prev, status];
                          }
                        });
                      }}
                    >
                      <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                        {selectedStatuses.includes(status) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span>{status}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
