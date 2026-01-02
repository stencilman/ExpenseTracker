"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  pageSize?: number;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  columnVisibility?: VisibilityState;
  className?: string;
  isAllRowsSelected?: boolean;
  selectedRows?: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = false,
  pageSize = 20,
  enableRowSelection = false,
  onSelectedRowsChange,
  onRowClick,
  columnVisibility = {},
  className = "",
  isAllRowsSelected = false,
  selectedRows,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [visibility, setVisibility] =
    React.useState<VisibilityState>(columnVisibility);

  // Create a column for selection checkboxes if row selection is enabled
  const selectionColumn: ColumnDef<TData, any> = {
    id: "select",
    size: 40, // Small fixed width for checkbox column
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  // Add selection column if row selection is enabled
  const tableColumns = React.useMemo(() => {
    return enableRowSelection ? [selectionColumn, ...columns] : columns;
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility: visibility,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
      columnVisibility: columnVisibility,
    },
    enableRowSelection,
  });

  // Use a ref to store previous selection to prevent unnecessary updates
  const prevSelectionRef = React.useRef<string>("");

  // Effect to handle external selection changes
  React.useEffect(() => {
    if (enableRowSelection) {
      if (isAllRowsSelected) {
        // Force select all rows directly
        const allRowsSelected: Record<number, boolean> = {};
        data.forEach((_, index) => {
          allRowsSelected[index] = true;
        });
        table.setRowSelection(allRowsSelected);
      } else if (selectedRows) {
        // Clear current selection
        table.resetRowSelection();

        // Set new selection based on selectedRows prop
        const rowIds: Record<number, boolean> = {};
        selectedRows.forEach((row) => {
          // Find the row index in the current data
          const rowIndex = data.findIndex(
            (item) => JSON.stringify(item) === JSON.stringify(row)
          );
          if (rowIndex >= 0) {
            rowIds[rowIndex] = true;
          }
        });

        table.setRowSelection(rowIds);
      }
    }
  }, [selectedRows, isAllRowsSelected, table, data, enableRowSelection]);

  React.useEffect(() => {
    // Programmatically update selection state when isAllRowsSelected prop changes
    if (enableRowSelection && isAllRowsSelected) {
      // Force select all rows directly
      const allRowsSelected: Record<number, boolean> = {};
      data.forEach((_, index) => {
        allRowsSelected[index] = true;
      });
      table.setRowSelection(allRowsSelected);
    }
  }, [isAllRowsSelected, table, enableRowSelection, data]);

  // Notify parent component when selection changes
  React.useEffect(() => {
    if (onSelectedRowsChange && enableRowSelection) {
      // Convert current selection to string for comparison
      const currentSelectionKey = JSON.stringify(
        Object.keys(rowSelection).sort()
      );

      // Only update if selection has changed
      if (prevSelectionRef.current !== currentSelectionKey) {
        const selectedRows = table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original);
        onSelectedRowsChange(selectedRows);
        prevSelectionRef.current = currentSelectionKey;
      }
    }
  }, [table, rowSelection, onSelectedRowsChange, enableRowSelection]);

  return (
    <div className={`space-y-4 ${className} `}>
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Get column width from size property or default to auto
                  const columnSize = header.column.columnDef.size || "auto";
                  const width =
                    typeof columnSize === "number"
                      ? `${columnSize}px`
                      : columnSize;

                  return (
                    <TableHead
                      key={header.id}
                      style={{ width, minWidth: width, maxWidth: width }}
                      className="overflow-hidden"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={(e) => {
                    // Don't trigger row click when clicking on checkbox or its container
                    if (
                      e.target instanceof HTMLElement &&
                      (e.target.closest('input[type="checkbox"]') ||
                        e.target.closest('[aria-label="Select row"]'))
                    ) {
                      return;
                    }

                    if (onRowClick) {
                      onRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Get column width from size property or default to auto
                    const columnSize = cell.column.columnDef.size || "auto";
                    const width =
                      typeof columnSize === "number"
                        ? `${columnSize}px`
                        : columnSize;

                    return (
                      <TableCell
                        key={cell.id}
                        style={{ width, minWidth: width, maxWidth: width }}
                        className="overflow-hidden"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <span className="text-muted-foreground">No results</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-end">
          {enableRowSelection && (
            <div className="text-sm text-muted-foreground mr-auto">
              {Object.keys(rowSelection).length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
