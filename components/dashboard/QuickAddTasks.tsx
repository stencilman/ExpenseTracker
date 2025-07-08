import { ArrowUpFromLine, FileText, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function QuickAddTasks() {
  return (
    <div className="w-2/3 h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-full">
                <ArrowUpFromLine className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-medium text-sm">Drag Receipts</h3>
              <p className="text-xs text-muted-foreground">
                or click here to attach
              </p>
            </button>

            <button className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-blue-50 rounded-full">
                <Receipt className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium text-sm">Create Expense</h3>
            </button>

            <button className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-orange-50 rounded-full">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-sm">Create Report</h3>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
