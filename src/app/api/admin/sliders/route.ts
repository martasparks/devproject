import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';
import { uploadToS3, deleteFromS3 } from '@lib/s3-upload';

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
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const buttonText = formData.get('buttonText') as string;
    const buttonUrl = formData.get('buttonUrl') as string;
    const showContent = formData.get('showContent') === 'on';
    const isActive = formData.get('isActive') === 'on';
    const order = parseInt(formData.get('order') as string) || 0;
    const desktopImageFile = formData.get('desktopImage') as File;
    const mobileImageFile = formData.get('mobileImage') as File | null;

    if (!title || !desktopImageFile) {
      return NextResponse.json(
        { error: 'Title and desktop image are required' },
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
        title,
        subtitle: subtitle || null,
        description: description || null,
        desktopImageUrl: desktopUploadResult.url!,
        desktopImageKey: desktopUploadResult.key!,
        mobileImageUrl,
        mobileImageKey,
        buttonText: buttonText || null,
        buttonUrl: buttonUrl || null,
        showContent,
        isActive,
        order,
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