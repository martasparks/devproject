import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // Create multiple images in a transaction
    const createdImages = await prisma.$transaction(
      images.map((image: any, index: number) => 
        prisma.productImage.create({
          data: {
            productId: id,
            imageUrl: image.imageUrl,
            imageKey: image.imageKey || null,
            altText: image.altText || null,
            order: image.order !== undefined ? image.order : index,
            isActive: image.isActive !== undefined ? image.isActive : true
          }
        })
      )
    );

    return NextResponse.json(createdImages, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk product images:', error);
    return NextResponse.json(
      { error: 'Failed to create product images' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // Replace all images for this product
    await prisma.$transaction(async (tx) => {
      // Delete existing images
      await tx.productImage.deleteMany({
        where: { productId: id }
      });

      // Create new images
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image: any, index: number) => ({
            productId: id,
            imageUrl: image.imageUrl,
            imageKey: image.imageKey || null,
            altText: image.altText || null,
            order: image.order !== undefined ? image.order : index,
            isActive: image.isActive !== undefined ? image.isActive : true
          }))
        });
      }
    });

    // Fetch and return the new images
    const updatedImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(updatedImages);
  } catch (error) {
    console.error('Error replacing product images:', error);
    return NextResponse.json(
      { error: 'Failed to replace product images' },
      { status: 500 }
    );
  }
}
