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
      select: {
        id: true,
        name: true,
        slug: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  }
                }
              }
            }
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            children: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

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