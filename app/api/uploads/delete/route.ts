import { NextResponse } from 'next/server';
import { deleteFileFromS3 } from '@/lib/s3-utils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { key } = data;
    
    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Extract the key from the URL if a full URL is provided
    const fileKey = key.includes('/') 
      ? key.split('/').pop() 
      : key;
    
    // Delete the file from S3
    await deleteFileFromS3(fileKey);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
