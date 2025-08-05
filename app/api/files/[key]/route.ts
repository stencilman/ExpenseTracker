import { auth } from "@/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * GET /api/files/[key]
 * Proxy endpoint to serve files from S3
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get the file key from the URL
    const { key } = params;
    if (!key) {
      return errorResponse("No file key provided", 400);
    }

    // Decode the key (it may be URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Set up the S3 get object parameters
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: decodedKey,
    };

    // Get the object from S3
    const command = new GetObjectCommand(getObjectParams);
    const response = await s3Client.send(command);

    // Check if the file was found
    if (!response.Body) {
      return errorResponse("File not found", 404);
    }

    // Convert the S3 response body to a readable stream
    const stream = Readable.from(response.Body as any);

    // Create a new response with the file content
    const newResponse = new NextResponse(stream as any);

    // Set the content type header if available
    if (response.ContentType) {
      newResponse.headers.set("Content-Type", response.ContentType);
    }

    // Set cache control headers
    newResponse.headers.set("Cache-Control", "public, max-age=86400"); // 1 day

    return newResponse;
  } catch (error: any) {
    console.error("Error in GET /api/files/[key]:", error);
    return errorResponse(
      `Server error: ${error.message || "Unknown error"} (Check server logs for details)`,
      500
    );
  }
}
