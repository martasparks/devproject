import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categorySlug = url.searchParams.get('category');
    const brandSlug = url.searchParams.get('brand');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      stockStatus: {
        not: 'MANUFACTURER_DELIVERY' // Only show products that are in stock
      }
    };

    // Filter by category
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: true }
      });
      
      if (category) {
        // Include the category and all its children
        const categoryIds = [category.id, ...category.children.map(c => c.id)];
        where.categoryId = {
          in: categoryIds
        };
      }
    }

    // Filter by brand
    if (brandSlug) {
      const brand = await prisma.productBrand.findUnique({
        where: { slug: brandSlug }
      });
      
      if (brand) {
        where.brandId = brand.id;
      }
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            include: {
              parent: {
                include: {
                  parent: {
                    include: {
                      parent: true
                    }
                  }
                }
              }
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              deliveryTime: true
            }
          },
          images: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            take: 3
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
