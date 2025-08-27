import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3-upload';
import { uploadSliderToS3 } from '@/lib/slider-image-optimizer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const isSlider = formData.get('isSlider') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Use slider-specific optimization if it's a slider image
    if (isSlider && folder === 'sliders') {
      const result = await uploadSliderToS3(file);
      
      if (result.desktop) {
        return NextResponse.json({ 
          success: true, 
          url: result.desktop.url, 
          key: result.desktop.key,
          optimized: true,
          format: 'webp'
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } else {
      // Regular upload with automatic optimization
      const result = await uploadToS3(file, folder);
      
      if (result.success) {
        const isWebP = result.key?.endsWith('.webp');
        return NextResponse.json({ 
          success: true, 
          url: result.url, 
          key: result.key,
          optimized: isWebP,
          format: isWebP ? 'webp' : 'original'
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}