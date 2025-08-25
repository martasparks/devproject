import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

// Cache for 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
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
      }
    });

    const response = NextResponse.json({ categories });
    
    // Set cache headers
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}