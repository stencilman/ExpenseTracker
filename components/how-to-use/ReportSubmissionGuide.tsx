"use client";

import React from "react";

export default function ReportSubmissionGuide() {
  return (
    <section className="mb-6 rounded-xl border border-border bg-muted/40 p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          How to use the reports workspace
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Follow this quick flow whenever you need to submit an expense report.
        </p>

        <div className="space-y-5 text-sm sm:text-base text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground">
              1. Create your report
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Go to Reports.</li>
              <li>Click New report.</li>
              <li>
                Enter the Business purpose and the Duration (start-end dates).
              </li>
              <li>Click Save Expense.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              2. Add expenses and tag them to the report
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Open Expenses and click Add expense.</li>
              <li>
                In the Report field, search for the report you just created and
                select it.
              </li>
              <li>
                Fill in the Merchant, Category, Expense date, Amount, and
                Description, then upload the receipt (image or PDF).
              </li>
              <li>Click Save Expense.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              3. Submit your report
            </h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium text-foreground">
                  Option A (any time):
                </span>{" "}
                Go to Reports, open the report, then click Submit Report.
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Option B (end of period):
                </span>{" "}
                After the report duration ends (for example, at the end of the
                month for October expenses), confirm every expense is added and
                click Submit Report.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm sm:text-base text-blue-900">
          <p className="font-medium">Notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              You can keep adding expenses to a draft report until you submit
              it.
            </li>
            <li>
              Make sure all required fields are filled. Receipts are mandatory.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
