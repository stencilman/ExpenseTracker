"use client";

import { ReceiptText, WalletMinimal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-utils";

interface PendingTasks {
  unreportedExpensesCount: number;
  unreportedExpensesAmount: number;
  unsubmittedReportsCount: number;
}

export default function PendingTasksCard() {
  const [pendingTasks, setPendingTasks] = useState<PendingTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/dashboard/pending-tasks");
        
        if (!response.ok) {
          throw new Error("Failed to fetch pending tasks");
        }
        
        const data = await response.json();
        setPendingTasks(data.data);
      } catch (err) {
        console.error("Error fetching pending tasks:", err);
        setError("Failed to load pending tasks");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingTasks();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="animate-pulse h-5 w-40 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-5 w-5 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="animate-pulse h-5 w-40 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">Error loading pending tasks</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Link href="/user/expenses" className="flex items-center gap-2 hover:text-blue-600">
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" asChild>
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Unreported Expenses
                    </span>
                  </div>
                </Button>
              </Link>
              <div className="flex flex-col items-end">
                <span className="font-medium">{pendingTasks?.unreportedExpensesCount || 0}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(pendingTasks?.unreportedExpensesAmount || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/user/reports" className="flex items-center gap-2 hover:text-blue-600">
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" asChild>
                  <div className="flex items-center gap-2">
                    <WalletMinimal className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Unsubmitted Reports
                    </span>
                  </div>
                </Button>
              </Link>
              <span className="font-medium">
                {pendingTasks?.unsubmittedReportsCount || 0}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
