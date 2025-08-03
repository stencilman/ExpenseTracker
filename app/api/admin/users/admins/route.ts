import { NextRequest, NextResponse } from "next/server";
import { getAdminUsers } from "@/data/users";

export async function GET(req: NextRequest) {
  try {
    // For testing, return mock data directly
    const mockAdminUsers = [
      { id: "1", name: "Admin User 1", email: "admin1@example.com" },
      { id: "2", name: "Admin User 2", email: "admin2@example.com" },
      { id: "3", name: "Admin User 3", email: "admin3@example.com" },
    ];
    
    return NextResponse.json({ data: mockAdminUsers }, { status: 200 });
    
    // Uncomment this when authentication is working
    // const adminUsers = await getAdminUsers();
    // return NextResponse.json({ data: adminUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
