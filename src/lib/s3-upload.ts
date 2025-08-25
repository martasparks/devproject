import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export async function uploadToS3(file: File, folder: string = 'uploads'): Promise<UploadResult> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // ACL: 'public-read', // ❌ IZŅEMT
      // (pēc izvēles) kešošana bildēm:
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;

    return { success: true, url, key: fileName };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return false;
  }
}