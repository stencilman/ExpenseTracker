import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

/**
 * Upload a file to S3
 * @param file File buffer
 * @param fileName Name of the file
 * @param contentType MIME type of the file
 * @returns Object with the URL of the uploaded file
 */
export async function uploadFileToS3(
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<{ key: string }> {
    // Create a unique file name to prevent overwriting
    const uniqueFileName = `${Date.now()}-${fileName}`;

    // Set up the S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: uniqueFileName,
        Body: file,
        ContentType: contentType
        // ACL parameter removed as the bucket doesn't allow ACLs
    };

    try {
        // Upload the file to S3
        await s3Client.send(new PutObjectCommand(params));

        // Return only the key; presigned URLs will be generated on demand
        return { key: uniqueFileName };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * List all files in the S3 bucket
 * @param prefix Optional prefix to filter files (folder path)
 * @param maxKeys Maximum number of keys to return
 * @returns Array of file objects with key, size, and lastModified
 */
export async function listS3Files(
    prefix?: string,
    maxKeys: number = 1000
): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: maxKeys
    };

    try {
        // List objects in the bucket
        const response = await s3Client.send(new ListObjectsV2Command(params));

        // Map the response to a more user-friendly format
        const files = [];

        // Process each item and generate presigned URLs
        if (response.Contents) {
            for (const item of response.Contents) {
                const presignedUrl = await getPresignedUrl(item.Key || '');
                files.push({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                    url: presignedUrl
                });
            }
        }

        return files;
    } catch (error) {
        console.error('Error listing files from S3:', error);
        throw new Error(`Failed to list files from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a presigned URL for an S3 object
 * @param key The key (filename) of the object in S3
 * @param expiresIn Time in seconds until the presigned URL expires (default: 3600 seconds = 1 hour)
 * @returns A presigned URL for the object
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        const command = new GetObjectCommand(params);
        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete a file from S3
 * @param key The key (filename) of the object in S3
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteFileFromS3(key: string): Promise<void> {
    if (!key) {
        throw new Error('File key is required');
    }

    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
        console.log(`File ${key} deleted successfully from S3`);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
