import { optimizeImageToWebP, ImageOptimizationOptions } from './image-optimizer';

// Slider specific optimization settings
export const SLIDER_IMAGE_OPTIONS: ImageOptimizationOptions = {
  quality: 80, // Good balance between quality and file size for hero images
  width: 1920, // Full HD width for sliders
  height: 1080, // Full HD height for sliders
  fit: 'cover' // Cover to maintain aspect ratio
};

export const SLIDER_MOBILE_OPTIONS: ImageOptimizationOptions = {
  quality: 80, // Good balance between quality and file size
  width: 1080, // Instagram post width
  height: 1350, // Instagram post height (4:5 aspect ratio)
  fit: 'inside' // Use 'inside' to preserve full image without cropping
};

export async function optimizeSliderImage(
  buffer: Buffer, 
  isMobile: boolean = false
): Promise<Buffer> {
  const options = isMobile ? SLIDER_MOBILE_OPTIONS : SLIDER_IMAGE_OPTIONS;
  return optimizeImageToWebP(buffer, options);
}

export function getSliderFileName(originalName: string, isMobile: boolean = false): string {
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const suffix = isMobile ? '-mobile' : '';
  
  return `sliders/${timestamp}-${random}-${nameWithoutExt}${suffix}.webp`;
}

// Alternative upload function specifically for sliders with multiple sizes
export async function uploadSliderToS3(file: File): Promise<{
  desktop?: { url: string; key: string };
  mobile?: { url: string; key: string };
  error?: string;
}> {
  try {
    const { uploadToS3 } = await import('./s3-upload');
    
    // Create a new File object that will be optimized by the main upload function
    const result = await uploadToS3(file, 'sliders');
    
    if (result.success && result.url && result.key) {
      return {
        desktop: { url: result.url, key: result.key }
      };
    } else {
      return { error: result.error || 'Upload failed' };
    }
  } catch (error) {
    console.error('Slider upload error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}