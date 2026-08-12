"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  countActiveFilters,
  EMPTY_REPORT_FILTERS,
  ReportFilterValues,
} from "@/hooks/use-admin-reports";
// Type-only so the Prisma-backed module never reaches the client bundle.
import type { ReportListScope } from "@/lib/report-filters";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Download,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Submitter {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface ReportsFilterBarProps {
  filters: ReportFilterValues;
  onFiltersChange: (filters: ReportFilterValues) => void;
  onReset: () => void;
  /** Label for the date range, which differs per tab (submitted/approved/…). */
  dateLabel?: string;
  /** Only the "All Reports" tab spans multiple statuses. */
  showStatusFilter?: boolean;
  /** Tab identifier the CSV export should scope to. */
  exportScope?: ReportListScope;
  /** Current filters as a query string, forwarded to the export endpoint. */
  exportQuery?: string;
  totalCount?: number;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Awaiting Approval" },
  { value: "APPROVED", label: "Awaiting Reimbursement" },
  { value: "REIMBURSED", label: "Reimbursed" },
  { value: "REJECTED", label: "Rejected" },
];

const submitterName = (user: Submitter) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
  user.email ||
  "Unknown user";

export function ReportsFilterBar({
  filters,
  onFiltersChange,
  onReset,
  dateLabel = "Date range",
  showStatusFilter = false,
  exportScope,
  exportQuery = "",
  totalCount,
  isLoading = false,
}: ReportsFilterBarProps) {
  const [open, setOpen] = React.useState(false);
  const [submitters, setSubmitters] = React.useState<Submitter[]>([]);
  const [isExporting, setIsExporting] = React.useState(false);

  // Draft state so the popover only applies on "Apply", but search stays live.
  const [draft, setDraft] = React.useState<ReportFilterValues>(filters);

  React.useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (!cancelled) setSubmitters(json.data ?? []);
      })
      .catch(() => {
        // The submitter filter simply stays empty if the list can't be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = countActiveFilters(filters);
  const selectedSubmitter = submitters.find((u) => u.id === filters.submitterId);
  const draftSubmitter = submitters.find((u) => u.id === draft.submitterId);

  const applyDraft = () => {
    onFiltersChange({ ...draft, search: filters.search });
    setOpen(false);
  };

  const clearDraft = () => {
    setDraft({ ...EMPTY_REPORT_FILTERS, search: filters.search });
  };

  const clearFilter = (patch: Partial<ReportFilterValues>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  // Fetched as a blob rather than navigated to, so an error response shows a
  // toast instead of dumping the admin on a broken page.
  const handleExport = async () => {
    if (!exportScope) return;

    try {
      setIsExporting(true);
      const params = new URLSearchParams(exportQuery);
      params.delete("page");
      params.delete("pageSize");
      params.set("scope", exportScope);

      const response = await fetch(
        `/api/admin/reports/export?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const filename =
        response
          .headers.get("Content-Disposition")
          ?.match(/filename="?([^"]+)"?/)?.[1] ?? "reports.csv";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Export downloaded");
    } catch (err) {
      console.error("Error exporting reports:", err);
      toast.error("Failed to export reports. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const dateRangeLabel = () => {
    const { startDate, endDate } = filters;
    if (startDate && endDate)
      return `${format(startDate, "d MMM yyyy")} – ${format(
        endDate,
        "d MMM yyyy"
      )}`;
    if (startDate) return `From ${format(startDate, "d MMM yyyy")}`;
    if (endDate) return `Until ${format(endDate, "d MMM yyyy")}`;
    return "";
  };

  const amountRangeLabel = () => {
    const { minAmount, maxAmount } = filters;
    if (minAmount && maxAmount) return `Rs.${minAmount} – Rs.${maxAmount}`;
    if (minAmount) return `Min Rs.${minAmount}`;
    if (maxAmount) return `Max Rs.${maxAmount}`;
    return "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            placeholder="Search by report #, title, or submitter"
            className="pl-9 pr-9"
          />
          {filters.search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onFiltersChange({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <ListFilter className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[calc(100vw-2rem)] max-w-[340px] p-4"
            align="start"
          >
            <div className="grid gap-4">
              {/* Date range */}
              <div className="grid gap-2">
                <Label>{dateLabel}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !draft.startDate && "text-muted-foreground"
                      )}
                    >
                      {draft.startDate
                        ? draft.endDate
                          ? `${format(draft.startDate, "d MMM yyyy")} – ${format(
                              draft.endDate,
                              "d MMM yyyy"
                            )}`
                          : format(draft.startDate, "d MMM yyyy")
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: draft.startDate, to: draft.endDate }}
                      onSelect={(range) =>
                        setDraft({
                          ...draft,
                          startDate: range?.from,
                          endDate: range?.to ?? range?.from,
                        })
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              {/* Amount range */}
              <div className="grid gap-2">
                <Label>Total amount (Rs.)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={draft.minAmount ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, minAmount: e.target.value })
                    }
                    className="h-9"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={draft.maxAmount ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, maxAmount: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <Separator />

              {/* Submitter */}
              <div className="grid gap-2">
                <Label>Submitter</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between font-normal",
                        !draft.submitterId && "text-muted-foreground"
                      )}
                    >
                      {draftSubmitter
                        ? submitterName(draftSubmitter)
                        : "Any submitter"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-3rem)] max-w-[290px] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search people..." />
                      <CommandList>
                        <CommandEmpty>No people found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() =>
                              setDraft({ ...draft, submitterId: undefined })
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !draft.submitterId ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Any submitter
                          </CommandItem>
                          {submitters.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${submitterName(user)} ${user.email ?? ""}`}
                              onSelect={() =>
                                setDraft({ ...draft, submitterId: user.id })
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  draft.submitterId === user.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">
                                {submitterName(user)}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {showStatusFilter && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((option) => {
                        const isSelected = draft.status === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                status: isSelected ? undefined : option.value,
                              })
                            }
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs transition-colors",
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-input text-muted-foreground hover:bg-accent"
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-1">
                <Button variant="ghost" size="sm" onClick={clearDraft}>
                  Clear
                </Button>
                <Button size="sm" onClick={applyDraft}>
                  Apply filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {(activeCount > 0 || filters.search) && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {typeof totalCount === "number" && (
            <span className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading…"
                : `${totalCount} report${totalCount === 1 ? "" : "s"}`}
            </span>
          )}

          {exportScope && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || isLoading || totalCount === 0}
              title="Download the reports matching the current filters"
            >
              {isExporting ? (
                <>
                  <Loader size="sm" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(filters.startDate || filters.endDate) && (
            <FilterChip
              label={`${dateLabel}: ${dateRangeLabel()}`}
              onRemove={() =>
                clearFilter({ startDate: undefined, endDate: undefined })
              }
            />
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <FilterChip
              label={`Amount: ${amountRangeLabel()}`}
              onRemove={() =>
                clearFilter({ minAmount: undefined, maxAmount: undefined })
              }
            />
          )}
          {filters.submitterId && (
            <FilterChip
              label={`Submitter: ${
                selectedSubmitter ? submitterName(selectedSubmitter) : "Selected"
              }`}
              onRemove={() => clearFilter({ submitterId: undefined })}
            />
          )}
          {filters.status && (
            <FilterChip
              label={`Status: ${
                STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ??
                filters.status
              }`}
              onRemove={() => clearFilter({ status: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-background"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
