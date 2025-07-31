import { db } from "@/lib/db";
import { ReportEventType, ReportStatus } from "@prisma/client";
import { createReportHistoryEntry } from "./report-history";

// Import types from the schema
type ReportCreateInput = {
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
};

type ReportUpdateInput = {
    title?: string;
    description?: string;
    status?: ReportStatus;
    startDate?: Date;
    endDate?: Date;
};

/**
 * Create a new report
 */
export async function createReport(data: ReportCreateInput, userId: string) {
    // Create the report
    const report = await db.report.create({
        data: {
            ...data,
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            expenses: true,
        },
    });
    
    // Create history entry for report creation
    await createReportHistoryEntry({
        reportId: report.id,
        eventType: ReportEventType.CREATED,
        details: "Report created",
        performedById: userId,
    });
    
    return report;
}

/**
 * Get all reports with optional filtering
 */
export async function getReports(
    userId: string,
    {
        page = 1,
        pageSize = 10,
        status,
        search,
        startDate,
        endDate,
    }: {
        page?: number;
        pageSize?: number;
        status?: ReportStatus;
        search?: string;
        startDate?: Date;
        endDate?: Date;
    } = {}
) {
    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    // Add userId filter if provided (for regular users)
    // If userId is undefined, don't filter by user (for admin access)

    // Add filters if provided
    if (userId) {
        where.userId = userId;
    }
    
    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (startDate) {
        where.createdAt = { ...(where.createdAt || {}), gte: startDate };
    }

    if (endDate) {
        where.createdAt = { ...(where.createdAt || {}), lte: endDate };
    }

    // Get total count
    const totalCount = await db.report.count({ where });

    // Get paginated reports
    const reports = await db.report.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            expenses: {
                select: {
                    id: true,
                    amount: true,
                    merchant: true,
                    category: true,
                },
            },
            approver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: pageSize,
    });

    // Calculate and update the totalAmount for each report based on its expenses
    const updatedReports = reports.map(report => {
        // Calculate the sum of all expense amounts
        const calculatedTotal = report.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // If the report has expenses but totalAmount is 0, update it
        if (report.expenses.length > 0 && report.totalAmount === 0) {
            return {
                ...report,
                totalAmount: calculatedTotal
            };
        }
        
        return report;
    });

    return {
        data: updatedReports,
        meta: {
            totalCount,
            page,
            pageSize,
            pageCount: Math.ceil(totalCount / pageSize),
        },
    };
}

/**
 * Get a report by ID
 */
export async function getReportById(id: number, userId?: string) {
    const where: any = { id };

    // If userId is provided, ensure the report belongs to the user
    if (userId) {
        where.userId = userId;
    }

    const report = await db.report.findUnique({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            expenses: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            approver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    
    // Calculate total amount and non-reimbursable amount from all expenses
    if (report && report.expenses) {
        const totalAmount = report.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate non-reimbursable amount (sum of expenses where claimReimbursement is false)
        const nonReimbursableAmount = report.expenses
            .filter(expense => expense.claimReimbursement === false)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate amount to be reimbursed (total - non-reimbursable)
        const amountToBeReimbursed = totalAmount - nonReimbursableAmount;
        
        return {
            ...report,
            totalAmount,
            nonReimbursableAmount,
            amountToBeReimbursed
        };
    }
    
    return report;
}

/**
 * Update a report
 */
export async function updateReport(id: number, data: ReportUpdateInput, userId?: string) {
    const where: any = { id };

    // If userId is provided, ensure the report belongs to the user
    if (userId) {
        where.userId = userId;
    }

    return db.report.update({
        where,
        data,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            expenses: true,
            approver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
}

/**
 * Delete a report and update associated expenses to UNREPORTED status
 */
export async function deleteReport(id: number, userId?: string) {
    const where: any = { id };

    // If userId is provided, ensure the report belongs to the user
    if (userId) {
        where.userId = userId;
    }
    
    // Use a transaction to ensure both operations succeed or fail together
    return db.$transaction(async (tx) => {
        // First, find all expenses associated with this report and update their status
        await tx.expense.updateMany({
            where: { reportId: id },
            data: {
                reportId: null,
                status: "UNREPORTED"
            }
        });
        
        // Then delete the report
        return tx.report.delete({
            where,
        });
    });
}

/**
 * Add expenses to a report
 */
export async function addExpensesToReport(reportId: number, expenseIds: number[], userId?: string) {
    // Update each expense to associate with the report and create history entries
    const updatePromises = expenseIds.map((expenseId) => {
        // Create a history entry for the expense
        const historyPromise = db.expenseHistory.create({
            data: {
                eventType: "ADDED_TO_REPORT",
                details: `Added to report #${reportId}`,
                expenseId,
                reportId,
                performedById: userId || undefined,
            },
        });

        // Update the expense status
        const updatePromise = db.expense.update({
            where: { id: expenseId },
            data: {
                reportId,
                status: "REPORTED",
            },
        });

        // Return both promises to be executed
        return Promise.all([historyPromise, updatePromise]);
    });

    // Execute all updates in parallel
    await Promise.all(updatePromises.flat());

    // Recalculate the total amount for the report
    const expenses = await db.expense.findMany({
        where: { reportId },
        select: { amount: true, id: true },
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Update the report with the new total
    return db.report.update({
        where: { id: reportId },
        data: { totalAmount },
        include: {
            expenses: true,
        },
    });
}

/**
 * Remove expenses from a report
 */
export async function removeExpensesFromReport(reportId: number, expenseIds: number[]) {
    // Update each expense to disassociate from the report
    const updatePromises = expenseIds.map((expenseId) =>
        db.expense.update({
            where: { id: expenseId },
            data: {
                reportId: null,
                status: "UNREPORTED",
            },
        })
    );

    // Execute all updates in parallel
    await Promise.all(updatePromises);

    // Recalculate the total amount for the report
    const expenses = await db.expense.findMany({
        where: { reportId },
        select: { amount: true },
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Update the report with the new total
    return db.report.update({
        where: { id: reportId },
        data: { totalAmount },
        include: {
            expenses: true,
        },
    });
}

/**
 * Submit a report for approval
 */
export async function submitReport(id: number, userId: string) {
    // Get all expenses for this report to recalculate the total amount
    const expenses = await db.expense.findMany({
        where: { reportId: id }
    });
    
    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate non-reimbursable amount
    const nonReimbursableAmount = expenses
        .filter(expense => expense.claimReimbursement === false)
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate amount to be reimbursed
    const amountToBeReimbursed = totalAmount - nonReimbursableAmount;
    
    // Update the report
    const updatedReport = await db.report.update({
        where: { id, userId },
        data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
            totalAmount,
            // Store calculated amounts in the database
            // We could add these fields to the schema if needed
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            expenses: true,
            approver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    
    // Create history entry for report submission
    await createReportHistoryEntry({
        reportId: id,
        eventType: ReportEventType.SUBMITTED,
        details: `Report submitted for approval with total amount $${totalAmount.toFixed(2)}`,
        performedById: userId,
    });
    
    return updatedReport;
}

/**
 * Approve a report
 */
export async function approveReport(id: number, approverUserId: string) {
    // Update the report
    const updatedReport = await db.report.update({
        where: { id },
        data: {
            status: "APPROVED",
            approvedAt: new Date(),
            approvedById: approverUserId,
        },
    });
    
    // Create history entry for report approval
    await createReportHistoryEntry({
        reportId: id,
        eventType: ReportEventType.APPROVED,
        details: "Report approved",
        performedById: approverUserId,
    });
    
    return updatedReport;
}

/**
 * Reject a report
 */
export async function rejectReport(id: number, approverUserId: string) {
    // Update the report
    const updatedReport = await db.report.update({
        where: { id },
        data: {
            status: "REJECTED",
            rejectedAt: new Date(),
            approvedById: approverUserId,
        },
    });
    
    // Create history entry for report rejection
    await createReportHistoryEntry({
        reportId: id,
        eventType: ReportEventType.REJECTED,
        details: "Report rejected",
        performedById: approverUserId,
    });
    
    return updatedReport;
}

/**
 * Record reimbursement for a report
 */
export async function recordReimbursement(
    id: number,
    data: {
        reimbursementMethod: string;
        reimbursementRef?: string;
        reimbursementNotes?: string;
    },
    performedById?: string
) {
    // Update the report
    const updatedReport = await db.report.update({
        where: { id },
        data: {
            status: "REIMBURSED",
            reimbursedAt: new Date(),
            reimbursementMethod: data.reimbursementMethod,
            reimbursementRef: data.reimbursementRef,
            reimbursementNotes: data.reimbursementNotes,
        },
    });
    
    // Create history entry for report reimbursement
    await createReportHistoryEntry({
        reportId: id,
        eventType: ReportEventType.REIMBURSED,
        details: `Report reimbursed via ${data.reimbursementMethod}${data.reimbursementRef ? ` (Ref: ${data.reimbursementRef})` : ''}`,
        performedById,
    });
    
    return updatedReport;
}
