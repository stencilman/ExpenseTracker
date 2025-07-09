import { LucideIcon } from "lucide-react";

interface ReportItemProps {
  icon: LucideIcon;
  title: string;
  dateRange: string;
  total: string;
  expenseCount: number;
  toBeReimbursed: string;
  status?: {
    label: string;
    color: "green" | "orange" | "blue" | "red";
    additionalInfo?: string;
  };
}

export default function ReportItem({
  icon: Icon,
  title,
  dateRange,
  total,
  expenseCount,
  toBeReimbursed,
  status,
}: ReportItemProps) {
  const getStatusClasses = (color: string): { bg: string; text: string } => {
    switch (color) {
      case "green":
        return { bg: "bg-green-100", text: "text-green-500" };
      case "orange":
        return { bg: "bg-orange-100", text: "text-orange-500" };
      case "blue":
        return { bg: "bg-blue-100", text: "text-blue-500" };
      case "red":
        return { bg: "bg-red-100", text: "text-red-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-500" };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-y-4 md:gap-y-0 py-2 md:py-0">
      <div className="flex items-start gap-3 col-span-2 md:col-span-1">
        <div className="mt-1">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="text-blue-500 font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{dateRange}</div>
        </div>
      </div>
      <div className="text-right">
        <div>{total}</div>
        <div className="text-xs text-muted-foreground">
          ({expenseCount} expense{expenseCount !== 1 ? "s" : ""})
        </div>
      </div>
      <div className="hidden md:block text-right">
        <div>{toBeReimbursed}</div>
      </div>
      <div className="text-right flex items-center justify-end gap-2">
        {status && (
          <div className="flex flex-col">
            <div
              className={`${getStatusClasses(status.color).bg} ${
                getStatusClasses(status.color).text
              } text-xs px-2 py-1 rounded-md whitespace-nowrap`}
            >
              {status.label}
            </div>
            {status.additionalInfo && (
              <div className="text-xs text-muted-foreground">
                {status.additionalInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
