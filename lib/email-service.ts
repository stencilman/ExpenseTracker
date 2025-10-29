import sgMail from "@sendgrid/mail";
import { User } from "@prisma/client";

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// Get sender email from environment variables
const SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || "";

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

    await sgMail.send(msg);
    console.log(`Report approval email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report approval email:", error);
    if (error.response) {
      console.error("SendGrid API error:", {
        status: error.response.status,
        body: error.response.body,
      });
    }
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

    await sgMail.send(msg);
    console.log(`Report rejection email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report rejection email:", error);
    if (error.response) {
      console.error("SendGrid API error:", {
        status: error.response.status,
        body: error.response.body,
      });
    }
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

    await sgMail.send(msg);
    console.log(`Report reimbursement email sent to: ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send report reimbursement email:", error);
    if (error.response) {
      console.error("SendGrid API error:", {
        status: error.response.status,
        body: error.response.body,
      });
    }
    return false;
  }
}
