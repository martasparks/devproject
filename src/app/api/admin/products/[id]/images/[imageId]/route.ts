import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await params;

    const image = await prisma.productImage.findUnique({
      where: { 
        id: imageId,
        productId: id 
      }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching product image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await params;
    const body = await request.json();

    // Check if image exists and belongs to the product
    const existingImage = await prisma.productImage.findUnique({
      where: { 
        id: imageId,
        productId: id 
      }
    });

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const { imageUrl, imageKey, altText, order, isActive } = body;

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        imageUrl: imageUrl || existingImage.imageUrl,
        imageKey: imageKey !== undefined ? imageKey : existingImage.imageKey,
        altText: altText !== undefined ? altText : existingImage.altText,
        order: order !== undefined ? order : existingImage.order,
        isActive: isActive !== undefined ? isActive : existingImage.isActive
      }
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Error updating product image:', error);
    return NextResponse.json(
      { error: 'Failed to update product image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await params;

    // Check if image exists and belongs to the product
    const image = await prisma.productImage.findUnique({
      where: { 
        id: imageId,
        productId: id 
      }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    await prisma.productImage.delete({
      where: { id: imageId }
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting product image:', error);
    return NextResponse.json(
      { error: 'Failed to delete product image' },
      { status: 500 }
    );
  }
}
