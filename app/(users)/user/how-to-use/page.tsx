"use client";

import ReportSubmissionGuide from "@/components/how-to-use/ReportSubmissionGuide";

export default function HowToUsePage() {
  return (
    <div className="container mx-auto py-6 space-y-6 h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">How to use ExpenseTracker</h1>
        <p className="text-muted-foreground">
          Start here to understand the end-to-end flow for preparing, tagging, and submitting your expense
          reports.
        </p>
      </div>

      <ReportSubmissionGuide />
    </div>
  );
}


