import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOption = {
  field: string;
  direction: "asc" | "desc";
};

interface ExpensesSortProps {
  onSortChange: (sort: SortOption) => void;
}

export function ExpensesSort({ onSortChange }: ExpensesSortProps) {
  const [activeSort, setActiveSort] = React.useState<SortOption | null>(null);

  const sortOptions = [
    { label: "Date (Newest First)", field: "date", direction: "desc" as const },
    { label: "Date (Oldest First)", field: "date", direction: "asc" as const },
    { label: "Amount (High to Low)", field: "amount", direction: "desc" as const },
    { label: "Amount (Low to High)", field: "amount", direction: "asc" as const },
    { label: "Merchant (A-Z)", field: "merchant", direction: "asc" as const },
    { label: "Merchant (Z-A)", field: "merchant", direction: "desc" as const },
    { label: "Category (A-Z)", field: "category", direction: "asc" as const },
    { label: "Category (Z-A)", field: "category", direction: "desc" as const },
  ];

  const handleSortSelect = (field: string, direction: "asc" | "desc") => {
    const newSort = { field, direction };
    setActiveSort(newSort);
    onSortChange(newSort);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {activeSort ? (
            <>
              Sort: {sortOptions.find(
                (option) => 
                  option.field === activeSort.field && 
                  option.direction === activeSort.direction
              )?.label || "Custom"}
            </>
          ) : (
            "Sort"
          )}
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={`${option.field}-${option.direction}`}
              onClick={() => handleSortSelect(option.field, option.direction)}
              className="flex items-center justify-between cursor-pointer"
            >
              {option.label}
              {activeSort?.field === option.field && 
               activeSort?.direction === option.direction && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
