import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Update user with all fields
 */
export async function updateUserFull(
  userId: string, 
  data: { 
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    approverId?: string | null;
    roleName?: string | null;
    employeeId?: string | null;
    mobile?: string | null;
    department?: string | null;
    designation?: string | null;
    dateOfJoining?: Date | null;
    dateOfBirth?: Date | null;
  }
) {
  try {
    // Validate that approverId exists if provided
    if (data.approverId) {
      const approver = await prisma.user.findUnique({
        where: { id: data.approverId }
      });
      
      if (!approver) {
        throw new Error("Approver not found");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        roleName: true,
        approverId: true,
        employeeId: true,
        mobile: true,
        dateOfJoining: true,
        dateOfBirth: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw new Error("Failed to update user");
  }
}
