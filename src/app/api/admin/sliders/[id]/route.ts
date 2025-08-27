import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';
import { uploadToS3, deleteFromS3 } from '@lib/s3-upload';
import { processSliderButtonUrl } from '@lib/url-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!slider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Get slider error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingSlider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
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
    const order = parseInt(formData.get('order') as string) || existingSlider.order;
    const desktopImageFile = formData.get('desktopImage') as File | null;
    const mobileImageFile = formData.get('mobileImage') as File | null;


    let desktopImageUrl = existingSlider.desktopImageUrl;
    let desktopImageKey = existingSlider.desktopImageKey;
    let mobileImageUrl = existingSlider.mobileImageUrl;
    let mobileImageKey = existingSlider.mobileImageKey;

    if (desktopImageFile && desktopImageFile.size > 0) {
      await deleteFromS3(existingSlider.desktopImageKey);
      
      const uploadResult = await uploadToS3(desktopImageFile, 'sliders/desktop');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || 'Desktop image upload failed' },
          { status: 500 }
        );
      }

      desktopImageUrl = uploadResult.url!;
      desktopImageKey = uploadResult.key!;
    }

    if (mobileImageFile && mobileImageFile.size > 0) {
      if (existingSlider.mobileImageKey) {
        await deleteFromS3(existingSlider.mobileImageKey);
      }
      
      const uploadResult = await uploadToS3(mobileImageFile, 'sliders/mobile');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || 'Mobile image upload failed' },
          { status: 500 }
        );
      }

      mobileImageUrl = uploadResult.url!;
      mobileImageKey = uploadResult.key!;
    }

    const slider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: {
        // Desktop fields
        desktopTitle: desktopTitle || null,
        desktopSubtitle: desktopSubtitle || null,
        desktopDescription: desktopDescription || null,
        desktopImageUrl,
        desktopImageKey,
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
        title: desktopTitle || existingSlider.title,
        subtitle: desktopSubtitle || existingSlider.subtitle,
        description: desktopDescription || existingSlider.description,
        buttonText: desktopButtonText || existingSlider.buttonText,
        buttonUrl: desktopButtonUrl || existingSlider.buttonUrl,
        showContent: desktopShowContent,
      },
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Update slider error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!slider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }

    await deleteFromS3(slider.desktopImageKey);
    if (slider.mobileImageKey) {
      await deleteFromS3(slider.mobileImageKey);
    }

    await prisma.slider.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}