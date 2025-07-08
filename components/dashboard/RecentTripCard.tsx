import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function RecentTripCard() {
  return (
    <div className="w-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Recent Trip</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center py-8 space-y-4">
          <p className="text-muted-foreground text-center">View your recent trip here.</p>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>New Trip</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
