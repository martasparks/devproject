import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';
import { uploadToS3, deleteFromS3 } from '@lib/s3-upload';
import { processSliderButtonUrl } from '@lib/url-utils';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sliders = await prisma.slider.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Get sliders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Desktop fields
    const desktopTitle = formData.get('desktopTitle') as string;
    const desktopSubtitle = formData.get('desktopSubtitle') as string;
    const desktopDescription = formData.get('desktopDescription') as string;
    const desktopButtonText = formData.get('desktopButtonText') as string;
    const desktopButtonUrlRaw = formData.get('desktopButtonUrl') as string;
    const desktopShowContent = formData.get('desktopShowContent') === 'on';
    
    // Mobile fields
    const mobileTitle = formData.get('mobileTitle') as string;
    const mobileSubtitle = formData.get('mobileSubtitle') as string;
    const mobileDescription = formData.get('mobileDescription') as string;
    const mobileButtonText = formData.get('mobileButtonText') as string;
    const mobileButtonUrlRaw = formData.get('mobileButtonUrl') as string;
    const mobileShowContent = formData.get('mobileShowContent') === 'on';
    
    // Process URLs - remove any locale prefixes for clean storage
    const desktopButtonUrl = processSliderButtonUrl(desktopButtonUrlRaw);
    const mobileButtonUrl = processSliderButtonUrl(mobileButtonUrlRaw);
    
    // General fields
    const isActive = formData.get('isActive') === 'on';
    const order = parseInt(formData.get('order') as string) || 0;
    const desktopImageFile = formData.get('desktopImage') as File;
    const mobileImageFile = formData.get('mobileImage') as File | null;

    if (!desktopImageFile) {
      return NextResponse.json(
        { error: 'Desktop image is required' },
        { status: 400 }
      );
    }

    const desktopUploadResult = await uploadToS3(desktopImageFile, 'sliders/desktop');
    
    if (!desktopUploadResult.success) {
      return NextResponse.json(
        { error: desktopUploadResult.error || 'Desktop image upload failed' },
        { status: 500 }
      );
    }

    let mobileImageUrl = null;
    let mobileImageKey = null;

    if (mobileImageFile && mobileImageFile.size > 0) {
      const mobileUploadResult = await uploadToS3(mobileImageFile, 'sliders/mobile');
      
      if (!mobileUploadResult.success) {
        await deleteFromS3(desktopUploadResult.key!);
        return NextResponse.json(
          { error: mobileUploadResult.error || 'Mobile image upload failed' },
          { status: 500 }
        );
      }

      mobileImageUrl = mobileUploadResult.url;
      mobileImageKey = mobileUploadResult.key;
    }

    const slider = await prisma.slider.create({
      data: {
        // Desktop fields
        desktopTitle: desktopTitle || null,
        desktopSubtitle: desktopSubtitle || null,
        desktopDescription: desktopDescription || null,
        desktopImageUrl: desktopUploadResult.url!,
        desktopImageKey: desktopUploadResult.key!,
        desktopButtonText: desktopButtonText || null,
        desktopButtonUrl: desktopButtonUrl || null,
        desktopShowContent,
        
        // Mobile fields
        mobileTitle: mobileTitle || null,
        mobileSubtitle: mobileSubtitle || null,
        mobileDescription: mobileDescription || null,
        mobileImageUrl,
        mobileImageKey,
        mobileButtonText: mobileButtonText || null,
        mobileButtonUrl: mobileButtonUrl || null,
        mobileShowContent,
        
        // General fields
        isActive,
        order,
        
        // Legacy compatibility (can be removed later)
        title: desktopTitle || null,
        subtitle: desktopSubtitle || null,
        description: desktopDescription || null,
        buttonText: desktopButtonText || null,
        buttonUrl: desktopButtonUrl || null,
        showContent: desktopShowContent,
      },
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Create slider error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}