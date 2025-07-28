import { auth } from "@/auth";
import { uploadFileToS3 } from "@/lib/s3-utils";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

/**
 * POST /api/uploads
 * Upload a file to S3 and return the URL
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Only JPG, PNG, and PDF files are allowed.", 400);
    }

    // Check file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return errorResponse("File size exceeds the 10MB limit", 400);
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const result = await uploadFileToS3(buffer, file.name, file.type);

    // Return the URL
    return jsonResponse({ url: result.url }, 201);
  } catch (error: any) {
    console.error("Error in POST /api/uploads:", error);
    return errorResponse(
      `Server error: ${error.message || "Unknown error"} (Check server logs for details)`,
      500
    );
  }
}
