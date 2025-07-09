"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsTable, Report } from "@/components/table/ReportsTable";
import { Button } from "@/components/ui/button";

export default function ReportsSummaryCard() {
  const [selectedReports, setSelectedReports] = React.useState<Report[]>([]);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };
  // Sample data for the reports table
  const recentReports: Report[] = [
    {
      id: "1",
      iconType: "calendar",
      title: "May-June",
      dateRange: "30/05/2025 - 30/05/2025",
      total: "Rs.1,995.00",
      expenseCount: 2,
      toBeReimbursed: "Rs.1,995.00",
      status: {
        label: "AWAITING APPROVAL",
        color: "orange",
        additionalInfo: "From 27/06/2025",
      },
    },
    {
      id: "2",
      iconType: "file-text",
      title: "Bhive Passes and Trial Interview expense",
      dateRange: "16/05/2025 - 16/05/2025",
      total: "Rs.3,486.00",
      expenseCount: 5,
      toBeReimbursed: "Rs.0.00",
      status: {
        label: "REIMBURSED",
        color: "green",
      },
    },
  ];

  // Empty data for other tabs
  const emptyReports: Report[] = [];
  return (
    <div className="w-full">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Reports Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="most-recent" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="min-w-full">
                <TabsTrigger value="most-recent" className="min-w-[150px]">
                  Most Recent
                </TabsTrigger>
                <TabsTrigger
                  value="unsubmitted-reports"
                  className="min-w-[150px]"
                >
                  Unsubmitted
                </TabsTrigger>
                <TabsTrigger
                  value="awaiting-approvals"
                  className="min-w-[150px]"
                >
                  Awaiting Approval
                </TabsTrigger>
                <TabsTrigger
                  value="awaiting-reimbursements"
                  className="min-w-[150px]"
                >
                  Awaiting Payment
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="most-recent">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div>{recentReports.length} Reports</div>
              </div>

              <div className="">
                <ReportsTable
                  data={recentReports}
                  enableRowSelection={true}
                  onSelectedRowsChange={handleSelectedRowsChange}
                />
              </div>

              <div className="flex justify-end mt-4">
                {selectedReports.length > 0 && (
                  <Button variant="outline" size="sm">
                    Process {selectedReports.length} selected
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="unsubmitted-reports">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div>{emptyReports.length} Reports (Rs.0.00)</div>
              </div>
              <div className="">
                <ReportsTable data={emptyReports} />
              </div>
            </TabsContent>

            <TabsContent value="awaiting-approvals">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div> {emptyReports.length} Reports (Rs.0.00)</div>
              </div>
              <div className="">
                <ReportsTable data={emptyReports} />
              </div>
            </TabsContent>

            <TabsContent value="awaiting-reimbursements">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div>0 Reports (Rs.0.00)</div>
              </div>
              <div className="">
                <ReportsTable data={emptyReports} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
