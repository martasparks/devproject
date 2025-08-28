import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manufacturers = await prisma.productBrand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manufacturers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, brandCode, slug, deliveryTime, logoUrl, description, isActive } = body;

    if (!name || !brandCode || !slug) {
      return NextResponse.json(
        { error: 'Name, brand code, and slug are required' },
        { status: 400 }
      );
    }

    // Check if brandCode or slug already exists
    const existing = await prisma.productBrand.findFirst({
      where: {
        OR: [
          { brandCode },
          { slug }
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

    const manufacturer = await prisma.productBrand.create({
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
    console.error('Error creating manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to create manufacturer' },
      { status: 500 }
    );
  }
}