import { NextResponse } from "next/server";
import { ExpenseCategory } from "@prisma/client";

/**
 * GET /api/expenses/categories
 * Returns all available expense categories
 */
export async function GET() {
  try {
    // Return all expense categories from the enum
    const categories = Object.values(ExpenseCategory);
    
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense categories" },
      { status: 500 }
    );
  }
}
