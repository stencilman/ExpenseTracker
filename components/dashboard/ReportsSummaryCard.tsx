"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsTable, Report } from "@/components/table/ReportsTable";
import { Button } from "@/components/ui/button";

interface ReportsSummary {
  recentReports: Report[];
  unsubmittedReports: Report[];
  awaitingApprovalReports: Report[];
  awaitingReimbursementReports: Report[];
}

export default function ReportsSummaryCard() {
  const [selectedReports, setSelectedReports] = React.useState<Report[]>([]);
  const [reportsSummary, setReportsSummary] = React.useState<ReportsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchReportsSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/dashboard/reports-summary");
        
        if (!response.ok) {
          throw new Error("Failed to fetch reports summary");
        }
        
        const data = await response.json();
        setReportsSummary(data.data);
      } catch (err) {
        console.error("Error fetching reports summary:", err);
        setError("Failed to load reports summary");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportsSummary();
  }, []);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };
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
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  Failed to load reports
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-blue-500 font-medium">Reports</div>
                    <div>{reportsSummary?.recentReports?.length || 0} Reports</div>
                  </div>

                  <div className="">
                    <ReportsTable
                      data={reportsSummary?.recentReports || []}
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
                </>
              )}
            </TabsContent>

            <TabsContent value="unsubmitted-reports">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  Failed to load reports
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-blue-500 font-medium">Reports</div>
                    <div>{reportsSummary?.unsubmittedReports?.length || 0} Reports</div>
                  </div>

                  <div className="">
                    <ReportsTable
                      data={reportsSummary?.unsubmittedReports || []}
                      enableRowSelection={true}
                      onSelectedRowsChange={handleSelectedRowsChange}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="awaiting-approvals">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  Failed to load reports
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-blue-500 font-medium">Reports</div>
                    <div>{reportsSummary?.awaitingApprovalReports?.length || 0} Reports</div>
                  </div>

                  <div className="">
                    <ReportsTable
                      data={reportsSummary?.awaitingApprovalReports || []}
                      enableRowSelection={true}
                      onSelectedRowsChange={handleSelectedRowsChange}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="awaiting-reimbursements">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  Failed to load reports
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-blue-500 font-medium">Reports</div>
                    <div>{reportsSummary?.awaitingReimbursementReports?.length || 0} Reports</div>
                  </div>

                  <div className="">
                    <ReportsTable
                      data={reportsSummary?.awaitingReimbursementReports || []}
                      enableRowSelection={true}
                      onSelectedRowsChange={handleSelectedRowsChange}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
