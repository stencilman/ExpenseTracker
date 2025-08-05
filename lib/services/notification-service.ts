import { ReportStatus, NotificationType, EntityType } from "@prisma/client";
import { createNotification } from "@/data/notifications";
import { db } from "@/lib/db";

/**
 * Sends a notification when a report status changes
 */
export async function sendReportStatusNotification(
    reportId: number,
    newStatus: ReportStatus,
    performedById?: string
) {
    try {
        // Get the report with user information
        const report = await db.report.findUnique({
            where: { id: reportId },
            include: {
                user: true,
                approver: true,
            },
        });

        if (!report) {
            console.error(`Report with ID ${reportId} not found`);
            return;
        }

        let notificationType: NotificationType;
        let title: string;
        let message: string;
        let recipientId: string;

        switch (newStatus) {
            case ReportStatus.SUBMITTED:
                // Notify the approver when a report is submitted
                if (!report.approver?.id) {
                    console.error(`No approver found for report ${reportId}`);
                    return;
                }

                notificationType = NotificationType.REPORT_SUBMITTED;
                title = "New Report Submitted";
                message = `${report.user.firstName} ${report.user.lastName} has submitted a new expense report: ${report.title}`;
                recipientId = report.approver.id;
                break;

            case ReportStatus.APPROVED:
                // Notify the submitter when their report is approved
                notificationType = NotificationType.REPORT_APPROVED;
                title = "Report Approved";
                message = `Your expense report "${report.title}" has been approved`;
                recipientId = report.userId;
                break;

            case ReportStatus.REJECTED:
                // Notify the submitter when their report is rejected
                notificationType = NotificationType.REPORT_REJECTED;
                title = "Report Rejected";
                message = `Your expense report "${report.title}" has been rejected`;
                recipientId = report.userId;
                break;

            case ReportStatus.REIMBURSED:
                // Notify the submitter when their report is reimbursed
                notificationType = NotificationType.REPORT_REIMBURSED;
                title = "Report Reimbursed";
                message = `Your expense report "${report.title}" has been reimbursed`;
                recipientId = report.userId;
                break;

            default:
                // No notification for other status changes
                return;
        }

        // Create the notification
        await createNotification({
            userId: recipientId,
            title,
            message,
            type: notificationType,
            relatedEntityId: reportId.toString(),
            relatedEntityType: EntityType.REPORT,
        });

        console.log(`Notification sent for report ${reportId} status change to ${newStatus}`);
    } catch (error) {
        console.error("Error sending report status notification:", error);
    }
}

/**
 * Sends a system announcement to all users or users with a specific role
 */
export async function sendSystemAnnouncement({
    title,
    message,
    targetRole,
}: {
    title: string;
    message: string;
    targetRole?: string;
}) {
    try {
        // Get user IDs based on target role (or all users if no role specified)
        const whereClause = targetRole ? { role: targetRole as any } : {};

        const users = await db.user.findMany({
            where: whereClause,
            select: {
                id: true,
            },
        });

        const userIds = users.map((user: { id: string }) => user.id);

        if (userIds.length === 0) {
            console.error("No users found matching the criteria");
            return;
        }

        // Create notifications for each user
        const notifications = userIds.map((userId: string) => ({
            userId,
            title,
            message,
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            relatedEntityType: EntityType.SYSTEM,
        }));

        // Use createNotification for each notification instead of createMany
        for (const notification of notifications) {
            await createNotification(notification);
        }

        console.log(`System announcement sent to ${userIds.length} users`);
    } catch (error) {
        console.error("Error sending system announcement:", error);
    }
}
