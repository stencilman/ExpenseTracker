import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updateUserFull } from "@/data/users-extended";
import { z } from "zod";

// Full user update schema
const userFullUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  approverId: z.string().nullable().optional(),
  roleName: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  dateOfJoining: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
  dateOfBirth: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
});

// PATCH /api/admin/users/:id/update
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
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("Received update request for user:", id, body);
    
    const validationResult = userFullUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.format());
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Update user with all fields
    const updatedUser = await updateUserFull(
      id,
      validationResult.data
    );

    console.log("User updated successfully:", updatedUser);
    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
