"use client";

import { ArrowUpFromLine, FileText, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReceiptUploadDrawer from "./ReceiptUploadDrawer";
import Link from "next/link";

export default function QuickAddTasks() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open drawer when files are dragged over
    if (e.type === "dragover" && !drawerOpen) {
      setDrawerOpen(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store dropped files to pass to the drawer
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setDraggedFiles(newFiles);
    }
  };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 divide-x overflow-hidden">
          <Button
            variant="ghost"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none cursor-pointer"
            onClick={() => setDrawerOpen(true)}
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-4 p-4 bg-green-50">
              <ArrowUpFromLine className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-medium text-sm">Drag Receipts</h3>
            <p className="text-xs text-muted-foreground">
              or click here to attach
            </p>
          </Button>

          <Link
            href="/expenses"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none"
          >
            <div className="mb-4 p-4 bg-blue-50">
              <Receipt className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium text-sm">Create Expense</h3>
          </Link>

          <Link
            href="/reports"
            className="flex flex-col items-center text-center h-auto py-4 hover:bg-slate-50 rounded-none"
          >
            <div className="mb-4 p-4 bg-orange-50">
              <FileText className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-medium text-sm">Create Report</h3>
          </Link>
        </div>
      </CardContent>

      {/* Receipt Upload Drawer */}
      <ReceiptUploadDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDraggedFiles([]);
        }}
        initialFiles={draggedFiles}
      />
    </Card>
  );
}
