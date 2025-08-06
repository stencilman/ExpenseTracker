import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updateUserRoleAndApprover } from "@/data/users";
import { z } from "zod";

// User update schema for role and approver
const userUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  approverId: z.string().nullable().optional(),
  roleName: z.string().nullable().optional(),
});

// PATCH /api/admin/users/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is an admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the user ID from the URL
    const { id } = await params;
    const userId = parseInt(id);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = userUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Update user role and approver
    const updatedUser = await updateUserRoleAndApprover(
      userId.toString(),
      validationResult.data
    );

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
