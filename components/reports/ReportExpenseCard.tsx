"use client";

import { FileText } from "lucide-react";

interface ReportExpenseCardProps {
  date: string;
  merchant: string;
  category: string;
  amount: string | number;
  iconColor?: string;
  icon?: React.ReactNode;
}

export default function ReportExpenseCard({
  date,
  merchant,
  category,
  amount,
  iconColor = "bg-red-500",
  icon = <FileText className="h-5 w-5 text-white" />,
}: ReportExpenseCardProps) {
  // Format amount if it's a number
  const formattedAmount = typeof amount === "number" 
    ? `Rs.${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : amount;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <div className="w-12">
          <div className={`${iconColor} h-10 w-10 rounded flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {date}
                </span>
                <span className="font-medium">
                  {merchant}
                </span>
              </div>
              <div className="text-sm text-blue-600">
                {category}
              </div>
            </div>
            <div className="font-bold">{formattedAmount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
