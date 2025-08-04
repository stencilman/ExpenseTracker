import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    // Get user profile from database
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
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

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return jsonResponse({ data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return errorResponse("Failed to fetch user profile", 500);
  }
}
