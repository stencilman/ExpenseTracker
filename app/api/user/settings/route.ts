import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserSettingsSchema } from "@/lib/validations/user";

// GET /api/user/settings - Get current user settings
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userDetails = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        employeeId: true,
        mobile: true,
        department: true,
        dateOfJoining: true,
        dateOfBirth: true,
        designation: true,
        roleName: true,
        approverId: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          }
        },
        role: true,
      }
    });

    if (!userDetails) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error("[USER_SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/settings - Update user settings
export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Convert date strings to Date objects before validation
    if (body.dateOfJoining && typeof body.dateOfJoining === 'string') {
      body.dateOfJoining = new Date(body.dateOfJoining);
    }
    
    if (body.dateOfBirth && typeof body.dateOfBirth === 'string') {
      body.dateOfBirth = new Date(body.dateOfBirth);
    }
    
    // Validate the request body
    const validatedData = UserSettingsSchema.parse(body);

    // Prepare data for update, filtering out empty strings for foreign keys
    const updateData: any = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      employeeId: validatedData.employeeId,
      mobile: validatedData.mobile,
      department: validatedData.department,
      dateOfJoining: validatedData.dateOfJoining,
      dateOfBirth: validatedData.dateOfBirth,
      designation: validatedData.designation,
      roleName: validatedData.roleName,
    };
    
    // Only include approverId if it's not an empty string
    if (validatedData.approverId && validatedData.approverId.trim() !== '') {
      updateData.approverId = validatedData.approverId;
    }
    
    // Update user settings
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        employeeId: true,
        mobile: true,
        department: true,
        dateOfJoining: true,
        dateOfBirth: true,
        designation: true,
        roleName: true,
        approverId: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          }
        },
        role: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("[USER_SETTINGS_PATCH]", error);
    
    // Handle Prisma errors
    if (error.code) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error meta:", error.meta);
      
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Handle foreign key constraint errors
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: `Foreign key constraint failed: ${error.meta?.field_name || 'unknown field'}` },
          { status: 400 }
        );
      }
    }
    
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
