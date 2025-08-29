import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true
              }
            }
          }
        },
        children: {
          include: {
            children: true,
            _count: {
              select: { products: true }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Category already has _count from include

    // Build breadcrumb path
    const breadcrumbs = [];
    let current = category.parent;
    while (current) {
      breadcrumbs.unshift(current);
      current = current.parent;
    }

    return NextResponse.json({
      category: {
        ...category,
        breadcrumbs
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}