import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function ReportsSummaryCard() {
  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle>Reports Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="most-recent" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="most-recent">Most Recent</TabsTrigger>
              <TabsTrigger value="unsubmitted-reports">
                Unsubmitted Reports
              </TabsTrigger>
              <TabsTrigger value="awaiting-approvals">
                Awaiting Approvals
              </TabsTrigger>
              <TabsTrigger value="awaiting-reimbursements">
                Awaiting Reimbursements
              </TabsTrigger>
            </TabsList>
            <TabsContent value="most-recent">Most Recent</TabsContent>
            <TabsContent value="unsubmitted-reports">
              Unsubmitted Reports
            </TabsContent>
            <TabsContent value="awaiting-approvals">
              Awaiting Approvals
            </TabsContent>
            <TabsContent value="awaiting-reimbursements">
              Awaiting Reimbursements
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
