import { Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportItem from "./ReportItem";

export default function ReportsSummaryCard() {
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
                <div>0 Reports</div>
              </div>

              <div className="">
                <div className="grid grid-cols-2 md:grid-cols-4 text-sm text-muted-foreground mb-2 border-b">
                  <div>REPORT DETAILS</div>
                  <div className="text-right md:text-right">TOTAL</div>
                  <div className="hidden md:block text-right">
                    TO BE REIMBURSED
                  </div>
                  <div className="text-right">STATUS</div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="mb-4">
                    <ReportItem
                      icon={Calendar}
                      title="May-June"
                      dateRange="30/05/2025 - 30/05/2025"
                      total="Rs.1,995.00"
                      expenseCount={2}
                      toBeReimbursed="Rs.1,995.00"
                      status={{
                        label: "AWAITING APPROVAL",
                        color: "orange",
                        additionalInfo: "From 27/06/2025",
                      }}
                    />
                  </div>

                  <div className="pt-4">
                    <ReportItem
                      icon={FileText}
                      title="Bhive Passes and Trial Interview expense"
                      dateRange="16/05/2025 - 16/05/2025"
                      total="Rs.3,486.00"
                      expenseCount={5}
                      toBeReimbursed="Rs.0.00"
                      status={{
                        label: "REIMBURSED",
                        color: "green",
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unsubmitted-reports">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div>0 Reports</div>
              </div>
              <div className="pt-4 text-center text-muted-foreground py-8">
                No unsubmitted reports found
              </div>
            </TabsContent>

            <TabsContent value="awaiting-approvals">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Report</div>
                <div>1 Report</div>
              </div>
              <div className="border-t pt-4 text-center text-muted-foreground py-8">
                No reports awaiting approval
              </div>
            </TabsContent>

            <TabsContent value="awaiting-reimbursements">
              <div className="flex justify-between mb-4">
                <div className="text-blue-500 font-medium">Reports</div>
                <div>0 Reports (Rs.0.00)</div>
              </div>
              <div className="border-t pt-4 text-center text-muted-foreground py-8">
                No reports awaiting reimbursement
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
