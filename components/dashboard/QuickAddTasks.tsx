import { ArrowUpFromLine, FileText, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function QuickAddTasks() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 divide-x overflow-hidden">
          <Button
            variant="ghost"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none"
          >
            <div className="mb-4 p-4 bg-green-50">
              <ArrowUpFromLine className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-medium text-sm">Drag Receipts</h3>
            <p className="text-xs text-muted-foreground">
              or click here to attach
            </p>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none"
          >
            <div className="mb-4 p-4 bg-blue-50">
              <Receipt className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium text-sm">Create Expense</h3>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none"
          >
            <div className="mb-4 p-4 bg-orange-50">
              <FileText className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-medium text-sm">Create Report</h3>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
