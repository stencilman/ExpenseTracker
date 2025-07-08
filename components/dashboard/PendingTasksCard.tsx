import { ReceiptText, WalletMinimal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function PendingTasksCard() {
  return (
    <div className="w-1/3 h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-grow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant={"ghost"}>
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Unreported Expenses
                  </span>
                </Button>
              </div>
              <span className="font-medium">1</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant={"ghost"}>
                  <WalletMinimal className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Unreported Advances
                  </span>
                </Button>
              </div>
              <span className="font-medium">Rs.0.00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
