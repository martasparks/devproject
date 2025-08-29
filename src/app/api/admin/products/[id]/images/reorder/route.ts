import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const { imageOrders } = body;

    if (!Array.isArray(imageOrders)) {
      return NextResponse.json(
        { error: 'imageOrders must be an array of {id, order} objects' },
        { status: 400 }
      );
    }

    // Update image orders in a transaction
    await prisma.$transaction(
      imageOrders.map((item: { id: string; order: number }) =>
        prisma.productImage.update({
          where: { 
            id: item.id,
            productId: id // Ensure the image belongs to this product
          },
          data: { order: item.order }
        })
      )
    );

    // Fetch updated images
    const updatedImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(updatedImages);
  } catch (error) {
    console.error('Error reordering product images:', error);
    return NextResponse.json(
      { error: 'Failed to reorder product images' },
      { status: 500 }
    );
  }
}
