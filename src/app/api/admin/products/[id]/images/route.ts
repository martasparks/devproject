import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product images' },
      { status: 500 }
    );
  }
}

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

    const { imageUrl, imageKey, altText, order } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Get the next order number if not provided
    let imageOrder = order;
    if (imageOrder === undefined || imageOrder === null) {
      const lastImage = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { order: 'desc' }
      });
      imageOrder = lastImage ? lastImage.order + 1 : 0;
    }

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        imageUrl,
        imageKey: imageKey || null,
        altText: altText || null,
        order: imageOrder,
        isActive: true
      }
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating product image:', error);
    return NextResponse.json(
      { error: 'Failed to create product image' },
      { status: 500 }
    );
  }
}
