import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { optimizeImageToWebP, getOptimizedFileName, needsOptimization, isImageFile } from './image-optimizer';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-north-1',
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
    let buffer: Buffer;
    let fileName: string;
    let contentType: string;

    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Check if it's an image that needs optimization
    if (isImageFile(file) && needsOptimization(file)) {
      try {
        let optimizationOptions = {
          quality: 80, // Good balance between quality and file size
        };

        // Apply specific optimizations for sliders
        if (folder.includes('sliders')) {
          if (folder.includes('desktop')) {
            optimizationOptions = {
              quality: 80,
              width: 1920,
              height: 1080,
              fit: 'cover' as const
            };
          } else if (folder.includes('mobile')) {
            optimizationOptions = {
              quality: 80,
              width: 1080,
              height: 1350,
              fit: 'inside' as const // Preserve full image without cropping
            };
          } else {
            // General slider optimization
            optimizationOptions = {
              quality: 80,
              width: 1920,
              height: 1080,
              fit: 'cover' as const
            };
          }
        }
        
        // Optimize to WebP format with high quality
        buffer = await optimizeImageToWebP(originalBuffer, optimizationOptions);
        fileName = getOptimizedFileName(file.name, folder);
        contentType = 'image/webp';
        
        console.log(`Optimized ${file.name} to WebP format for ${folder}`);
      } catch (optimizationError) {
        console.warn('Image optimization failed, uploading original:', optimizationError);
        // Log the specific error for debugging
        console.error('Optimization error details:', optimizationError);
        // Fallback to original file if optimization fails
        buffer = originalBuffer;
        const fileExtension = file.name.split('.').pop();
        fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        contentType = file.type;
      }
    } else {
      // Use original file for non-images or already optimized WebP
      buffer = originalBuffer;
      const fileExtension = file.name.split('.').pop();
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      contentType = file.type;
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
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