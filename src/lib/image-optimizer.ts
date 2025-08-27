import sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
}

export async function optimizeImageToWebP(
  buffer: Buffer, 
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const {
    quality = 80, // Good balance between quality and file size
    width,
    height,
    fit = 'inside'
  } = options;

  let sharpInstance = sharp(buffer);

  // Resize if dimensions are provided
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit,
      withoutEnlargement: true, // Don't upscale images
    });
  }

  // Convert to WebP with high quality
  const optimizedBuffer = await sharpInstance
    .webp({
      quality,
      effort: 6, // Maximum compression effort
      lossless: false, // Use lossy compression but with high quality
    })
    .toBuffer();

  return optimizedBuffer;
}

export function getOptimizedFileName(originalName: string, folder: string = 'uploads'): string {
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  return `${folder}/${timestamp}-${random}-${nameWithoutExt}.webp`;
}

export function isImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return supportedTypes.includes(file.type.toLowerCase());
}

export function needsOptimization(file: File): boolean {
  // Only optimize if it's not already WebP
  return file.type.toLowerCase() !== 'image/webp' && isImageFile(file);
}