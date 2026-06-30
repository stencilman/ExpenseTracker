import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
import { auth } from "@/auth";
import { sendPendingApprovalDigestEmail } from "@/lib/email-service";

const DIGEST_RECIPIENT = "hello@fastcode.ai";

function isValidCronSecret(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (token.length !== secret.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

async function runDigest(recipient = DIGEST_RECIPIENT) {
  const reports = await db.report.findMany({
    where: { status: ReportStatus.SUBMITTED },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const sent = await sendPendingApprovalDigestEmail(reports as any, recipient);
  return { count: reports.length, sent };
}

/**
 * GET /api/cron/pending-reimbursements
 * Called automatically by Vercel Cron at 8am IST (2:30 UTC) every day.
 * Requires Authorization: Bearer <CRON_SECRET> header.
 */
export async function GET(req: NextRequest) {
  if (!isValidCronSecret(req.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await runDigest();
  return NextResponse.json({ ...result, sentTo: DIGEST_RECIPIENT });
}

/**
 * POST /api/cron/pending-reimbursements
 * Manual trigger from the admin UI. Requires an active admin session.
 * Accepts optional { email: string } body to override the recipient (for testing).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  let recipient = DIGEST_RECIPIENT;
  try {
    const body = await req.json();
    if (body?.email) recipient = body.email;
  } catch {
    // no body or invalid JSON — use default
  }

  const result = await runDigest(recipient);
  return NextResponse.json({ ...result, sentTo: recipient });
}
