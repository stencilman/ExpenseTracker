import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || "noreply@fastcode.ai";

// Get the app URL from environment or use localhost as fallback
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Format a date safely for display in emails
 */
export function formatDateForEmail(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } catch (e) {
    return "Invalid date";
  }
}

// Report approval email template
const REPORT_APPROVED_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>Expense Report Approved</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #ffffff;
    }
    .footer {
      background-color: #f6f6f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: bold;
    }
    .report-info {
      background-color: #f9f9f9;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      margin: 20px 0;
    }
    .report-info p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Expense Report Approved</h1>
    </div>
    <div class="content">
      <p>Hello {{user_name}},</p>
      <p>Your expense report <strong>{{report_title}}</strong> has been approved.</p>
      <p>The report will be processed for reimbursement soon.</p>
      
      <div class="report-info">
        <p><strong>Report ID:</strong> {{report_id}}</p>
        <p><strong>Amount:</strong> {{report_amount}} INR</p>
        <p><strong>Submitted:</strong> {{submission_date}}</p>
      </div>
      
      <a href="{{view_url}}" class="button" style="color: white !important; text-decoration: none;">View Report Details</a>
      
      <p>Thank you,<br>Expense Tracker Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Expense Tracker system.</p>
      <p>© 2025 Expense Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Report rejection email template
const REPORT_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>Expense Report Rejected</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #F44336;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #ffffff;
    }
    .footer {
      background-color: #f6f6f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      background-color: #F44336;
      color: white !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: bold;
    }
    .report-info {
      background-color: #f9f9f9;
      border-left: 4px solid #F44336;
      padding: 15px;
      margin: 20px 0;
    }
    .report-info p {
      margin: 5px 0;
    }
    .rejection-reason {
      background-color: #fffbeb;
      border: 1px solid #fbbf24;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Expense Report Rejected</h1>
    </div>
    <div class="content">
      <p>Hello {{user_name}},</p>
      <p>Your expense report <strong>{{report_title}}</strong> has been rejected.</p>
      
      <div class="report-info">
        <p><strong>Report ID:</strong> {{report_id}}</p>
        <p><strong>Amount:</strong> {{report_amount}} INR</p>
        <p><strong>Submitted:</strong> {{submission_date}}</p>
      </div>
      
      {{#if rejection_reason}}
      <div class="rejection-reason">
        <p><strong>Reason for Rejection:</strong></p>
        <p>{{rejection_reason}}</p>
      </div>
      {{/if}}
      
      <p>Please review your report and make necessary corrections before resubmitting.</p>
      
      <a href="{{view_url}}" class="button" style="color: white !important; text-decoration: none;">View Report Details</a>
      
      <p>Thank you,<br>Expense Tracker Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Expense Tracker system.</p>
      <p>© 2025 Expense Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Report reimbursed email template
const REPORT_REIMBURSED_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>Expense Report Reimbursed</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #673AB7;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #ffffff;
    }
    .footer {
      background-color: #f6f6f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      background-color: #673AB7;
      color: white !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: bold;
    }
    .report-info {
      background-color: #f9f9f9;
      border-left: 4px solid #673AB7;
      padding: 15px;
      margin: 20px 0;
    }
    .report-info p {
      margin: 5px 0;
    }
    .payment-info {
      background-color: #f0f9ff;
      border: 1px solid #93c5fd;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Expense Report Reimbursed</h1>
    </div>
    <div class="content">
      <p>Hello {{user_name}},</p>
      <p>Your expense report <strong>{{report_title}}</strong> has been reimbursed.</p>
      <p>The reimbursement has been processed and should be reflected in your account soon.</p>
      
      <div class="report-info">
        <p><strong>Report ID:</strong> {{report_id}}</p>
        <p><strong>Amount:</strong> {{report_amount}} INR</p>
        <p><strong>Reimbursed:</strong> {{reimbursement_date}}</p>
      </div>
      
      {{#if payment_reference}}
      <div class="payment-info">
        <p><strong>Payment Reference:</strong> {{payment_reference}}</p>
      </div>
      {{/if}}
      
      <a href="{{view_url}}" class="button" style="color: white !important; text-decoration: none;">View Report Details</a>
      
      <p>If you have any questions about this reimbursement, please contact the finance department.</p>
      
      <p>Thank you,<br>Expense Tracker Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Expense Tracker system.</p>
      <p>© 2025 Expense Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Helper function to process templates with conditionals and variables
 */
function replaceTemplateVariables(
  template: string,
  data: Record<string, any>
): string {
  // Process template line by line for better control
  const lines = template.split("\n");
  let processedLines: string[] = [];
  let skipUntilEndIf = false;
  let skipUntilElse = false;
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // Check for conditional start
    const ifMatch = line.match(/\{\{#if\s+([^\}]+)\}\}/);
    if (ifMatch) {
      const condition = ifMatch[1].trim();

      // Check if condition is true
      if (data[condition]) {
        // Remove the {{#if condition}} part
        line = line.replace(/\{\{#if\s+([^\}]+)\}\}/, "");
        skipUntilElse = false;
      } else {
        // Skip until we find {{else}} or {{/if}}
        skipUntilElse = true;
        i++;
        continue;
      }
    }

    // Check for else
    if (line.includes("{{else}}")) {
      if (skipUntilElse) {
        // We were skipping, but now we found else, so stop skipping
        skipUntilElse = false;
        // Remove the {{else}} part
        line = line.replace(/\{\{else\}\}/, "");
      } else {
        // We weren't skipping, so now skip until end if
        skipUntilEndIf = true;
        i++;
        continue;
      }
    }

    // Check for conditional end
    if (line.includes("{{/if}}")) {
      // Reset flags
      skipUntilEndIf = false;
      skipUntilElse = false;
      // Remove the {{/if}} part
      line = line.replace(/\{\{\/if\}\}/, "");
    }

    // Skip if we're in a skip state
    if (skipUntilEndIf || skipUntilElse) {
      i++;
      continue;
    }

    // Replace variables in the line
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        const regex = new RegExp(`\{\{${key}\}\}`, "g");
        line = line.replace(regex, String(value));
      }
    }

    // Add processed line to result
    processedLines.push(line);
    i++;
  }

  return processedLines.join("\n");
}

/**
 * Interface for report email data
 */
export interface ReportEmailData {
  report_id: number | string;
  report_title: string;
  report_amount: number | string;
  user_name: string;
  submission_date?: string;
  reimbursement_date?: string;
  rejection_reason?: string;
  payment_reference?: string;
}

/**
 * Send report approval notification
 */
export async function sendReportApprovedEmail(
  userEmail: string,
  data: ReportEmailData
): Promise<boolean> {
  try {
    console.log(`Attempting to send approval email to ${userEmail}`);

    // Create view URL
    const viewUrl = `${APP_URL}/user/reports/${data.report_id}`;

    // Prepare complete data
    const templateData = {
      ...data,
      view_url: viewUrl,
    };

    // Replace template variables
    const html = replaceTemplateVariables(
      REPORT_APPROVED_TEMPLATE,
      templateData
    );

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: `Expense Report Approved: ${data.report_title}`,
      html: html,
    };

    await resend.emails.send(msg);
    console.log(`Report approval email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report approval email:", error);
    return false;
  }
}

/**
 * Send report rejection notification
 */
export async function sendReportRejectedEmail(
  userEmail: string,
  data: ReportEmailData
): Promise<boolean> {
  try {
    console.log(`Attempting to send rejection email to ${userEmail}`);

    // Create view URL
    const viewUrl = `${APP_URL}/user/reports/${data.report_id}`;

    // Prepare complete data
    const templateData = {
      ...data,
      view_url: viewUrl,
    };

    // Replace template variables
    const html = replaceTemplateVariables(
      REPORT_REJECTED_TEMPLATE,
      templateData
    );

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: `Expense Report Rejected: ${data.report_title}`,
      html: html,
    };

    await resend.emails.send(msg);
    console.log(`Report rejection email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report rejection email:", error);
    return false;
  }
}

/**
 * Build and send a daily digest of SUBMITTED reports awaiting approval to admin
 */
export async function sendPendingApprovalDigestEmail(
  reports: Array<{
    id: number | string;
    title: string;
    totalAmount: number;
    submittedAt: Date | string | null;
    user: { firstName: string | null; lastName: string | null; email: string } | null;
  }>,
  recipientEmail = "hello@fastcode.ai"
): Promise<boolean> {
  try {
    const total = reports.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);
    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    const rows = reports
      .map(
        (r, i) => `
      <tr class="report-row" style="border-bottom:1px solid #e2e8f0">
        <td class="report-cell" data-label="#" style="padding:10px 12px;color:#64748b;vertical-align:top">${i + 1}</td>
        <td class="report-cell" data-label="Employee" style="padding:10px 12px;vertical-align:top">
          ${r.user ? `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() : "—"}
          <br><span style="font-size:11px;color:#94a3b8">${r.user?.email ?? ""}</span>
        </td>
        <td class="report-cell" data-label="Report Title" style="padding:10px 12px;vertical-align:top">${r.title}</td>
        <td class="report-cell" data-label="Amount" style="padding:10px 12px;vertical-align:top;white-space:nowrap">₹${Number(r.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td class="report-cell" data-label="Submitted" style="padding:10px 12px;vertical-align:top;color:#64748b;white-space:nowrap">${r.submittedAt ? formatDateForEmail(r.submittedAt) : "—"}</td>
      </tr>`
      )
      .join("");

    const tableHtml =
      reports.length > 0
        ? `<table class="report-table" style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px">
        <thead class="report-thead">
          <tr style="background-color:#f1f5f9">
            <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">#</th>
            <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">Employee</th>
            <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">Report Title</th>
            <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">Amount</th>
            <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">Submitted</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
        : `<p style="color:#64748b;font-style:italic">No reports are currently awaiting approval.</p>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pending Approvals – Daily Digest</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 8px !important; }
      .email-header { padding: 16px !important; }
      .email-header h1 { font-size: 18px !important; }
      .email-body { padding: 16px !important; }
      .report-thead { display: none !important; }
      .report-row {
        display: block !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 8px !important;
        margin-bottom: 12px !important;
        background: #f8fafc !important;
        overflow: hidden !important;
      }
      .report-cell {
        display: block !important;
        padding: 8px 12px !important;
        text-align: left !important;
        white-space: normal !important;
        border-bottom: 1px solid #f1f5f9 !important;
      }
      .report-cell:last-child { border-bottom: none !important; }
      .report-cell:before {
        content: attr(data-label);
        display: block;
        font-size: 10px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 2px;
      }
      .cta-button { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f1f5f9">
  <div class="email-wrapper" style="max-width:700px;margin:0 auto;padding:20px">
    <div class="email-header" style="background-color:#2563EB;color:white;padding:24px;text-align:center;border-radius:6px 6px 0 0">
      <h1 style="margin:0 0 6px;font-size:22px">Daily Digest: Pending Approvals</h1>
      <p style="margin:0;opacity:0.85;font-size:14px">${dateStr} IST</p>
    </div>
    <div class="email-body" style="padding:24px;background:#ffffff;border:1px solid #e2e8f0;border-top:none">
      <div style="background:#eff6ff;border-left:4px solid #2563EB;padding:15px;margin-bottom:20px;border-radius:0 4px 4px 0">
        <p style="margin:0"><strong>${reports.length} report${reports.length !== 1 ? "s" : ""}</strong> awaiting approval</p>
        <p style="margin:4px 0 0;color:#1e40af"><strong>Total Amount: ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></p>
      </div>
      ${tableHtml}
      <a href="${APP_URL}admin/reports/awaiting-approval" class="cta-button"
         style="display:inline-block;background-color:#2563EB;color:white;text-decoration:none;padding:12px 24px;border-radius:4px;margin-top:8px;font-weight:bold;font-size:14px">
        Review in Admin Panel
      </a>
    </div>
    <div style="background:#f6f6f6;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 6px 6px">
      <p style="margin:0">This is an automated daily digest from the Expense Tracker system.</p>
      <p style="margin:4px 0 0">© 2025 Expense Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject: `[Daily Digest] ${reports.length} Report${reports.length !== 1 ? "s" : ""} Awaiting Approval`,
      html,
    });

    console.log(`Pending approval digest sent to ${recipientEmail} (${reports.length} reports)`);
    return true;
  } catch (error: any) {
    console.error("Failed to send pending approval digest email:", error);
    return false;
  }
}

/**
 * Send report reimbursed notification
 */
export async function sendReportReimbursedEmail(
  userEmail: string,
  data: ReportEmailData
): Promise<boolean> {
  try {
    console.log(`Attempting to send reimbursement email to ${userEmail}`);

    // Create view URL
    const viewUrl = `${APP_URL}/user/reports/${data.report_id}`;

    // Prepare complete data
    const templateData = {
      ...data,
      view_url: viewUrl,
    };

    // Replace template variables
    const html = replaceTemplateVariables(
      REPORT_REIMBURSED_TEMPLATE,
      templateData
    );

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: `Expense Report Reimbursed: ${data.report_title}`,
      html: html,
    };

    await resend.emails.send(msg);
    console.log(`Report reimbursement email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report reimbursement email:", error);
    return false;
  }
}
