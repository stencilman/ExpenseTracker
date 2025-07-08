import { ReceiptText, WalletMinimal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function PendingTasksCard() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" asChild>
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Unreported Expenses
                </span>
              </div>
            </Button>
            <span className="font-medium">1</span>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" asChild>
              <div className="flex items-center gap-2">
                <WalletMinimal className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Unreported Advances
                </span>
              </div>
            </Button>
            <span className="font-medium">Rs.0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
