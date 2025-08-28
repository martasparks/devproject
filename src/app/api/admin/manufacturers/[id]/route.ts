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
    const manufacturer = await prisma.productBrand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!manufacturer) {
      return NextResponse.json({ error: 'Manufacturer not found' }, { status: 404 });
    }

    return NextResponse.json(manufacturer);
  } catch (error) {
    console.error('Error fetching manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manufacturer' },
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
    const { name, brandCode, slug, deliveryTime, logoUrl, description, isActive } = body;

    if (!name || !brandCode || !slug) {
      return NextResponse.json(
        { error: 'Name, brand code, and slug are required' },
        { status: 400 }
      );
    }

    // Check if brandCode or slug already exists (excluding current manufacturer)
    const existing = await prisma.productBrand.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { brandCode },
              { slug }
            ]
          }
        ]
      }
    });

    if (existing) {
      const field = existing.brandCode === brandCode ? 'brand code' : 'slug';
      return NextResponse.json(
        { error: `A manufacturer with this ${field} already exists` },
        { status: 400 }
      );
    }

    const manufacturer = await prisma.productBrand.update({
      where: { id },
      data: {
        name,
        brandCode,
        slug,
        deliveryTime: deliveryTime || null,
        logoUrl: logoUrl || null,
        description: description || null,
        isActive: isActive ?? true,
      }
    });

    return NextResponse.json(manufacturer);
  } catch (error) {
    console.error('Error updating manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to update manufacturer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if manufacturer has any products
    const manufacturerWithProducts = await prisma.productBrand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!manufacturerWithProducts) {
      return NextResponse.json({ error: 'Manufacturer not found' }, { status: 404 });
    }

    if (manufacturerWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete manufacturer with existing products' },
        { status: 400 }
      );
    }

    await prisma.productBrand.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Manufacturer deleted successfully' });
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to delete manufacturer' },
      { status: 500 }
    );
  }
}