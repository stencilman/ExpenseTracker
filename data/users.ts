import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Get all users with their approvers
 */
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
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
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Update user role and approver
 */
/**
 * Get all admin users for approver selection
 */
export async function getAdminUsers() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN"
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return adminUsers.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    }));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw new Error("Failed to fetch admin users");
  }
}

/**
 * Update user role and approver
 */
export async function updateUserRoleAndApprover(
  userId: string, 
  data: { 
    role?: UserRole;
    approverId?: string | null;
    roleName?: string | null;
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
      data: {
        role: data.role,
        approverId: data.approverId,
        roleName: data.roleName
      },
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
