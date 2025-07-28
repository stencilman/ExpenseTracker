"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MoreHorizontal, X } from "lucide-react";
import ReportExpenseCard from "@/components/reports/ReportExpenseCard";

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-500">ER-{id}</span>
          </div>
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            APPROVED
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-xl font-bold mb-1">Bhive Passes</h1>
            <p className="text-sm text-gray-500 mb-6">
              Duration: 10/07/2025 - 10/07/2025
            </p>

            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses" className="relative w-64">
                  EXPENSES
                  <span className="absolute -top-1 -right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                </TabsTrigger>
                <TabsTrigger value="advances">ADVANCES & REFUNDS</TabsTrigger>
                <TabsTrigger value="history">HISTORY</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-4">
                <ReportExpenseCard 
                  date="01/07/2025"
                  merchant="TUSKER WORKSPACE PRIVATE LIMITED"
                  category="IT and Internet Expenses"
                  amount="Rs.944.00"
                />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Expense Amount</span>
                    <span className="font-medium">944.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Non-reimbursable Amount</span>
                    <span className="font-medium">(-) 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Applied Advance Amount</span>
                    <span className="font-medium">(-) 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Amount to be Reimbursed</span>
                    <span>Rs.944.00</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advances">
                <div className="text-center py-8 text-gray-500">
                  No advances or refunds for this report
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8 text-gray-500">
                  No history available
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold">Rs.944.00</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Amount to be Reimbursed
              </div>
              <div className="font-bold">Rs.944.00</div>
            </div>
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-yellow-800">P</span>
              </div>
              <div className="text-sm">prabal</div>
            </div>
            <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
              View approval flow
            </Button>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Policy</div>
              <div className="font-medium">Fast Code AI</div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Business Purpose</div>
              <div className="text-gray-400">-</div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Trip</div>
              <div className="text-gray-400">-</div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500 mb-1">Documents</div>
                <div className="text-gray-400">-</div>
              </div>
              <Button variant="ghost" size="icon">
                <span className="text-blue-600 text-xl font-bold">+</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
