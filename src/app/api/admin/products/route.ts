import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 1
        },
        _count: {
          select: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    
    const {
      productCode,
      name,
      slug,
      categoryId,
      brandId,
      shortDescription,
      fullDescription,
      price,
      salePrice,
      stockQuantity,
      stockStatus,
      mainImageUrl,
      mainImageKey,
      width,
      depth,
      height,
      weight,
      notes,
      metaTitle,
      metaDescription,
      isActive
    } = body;

    // Validate required fields
    if (!productCode || !name || !slug || !categoryId || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: productCode, name, slug, categoryId, price' },
        { status: 400 }
      );
    }

    // Check if product code already exists
    const existingProduct = await prisma.product.findUnique({
      where: { productCode }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this code already exists' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verify brand exists if provided
    if (brandId) {
      const brand = await prisma.productBrand.findUnique({
        where: { id: brandId }
      });

      if (!brand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }
    }

    // Create product and increment brand's nextProductNum in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          productCode,
          name,
          slug,
          categoryId,
          brandId: brandId || null,
          shortDescription: shortDescription || null,
          fullDescription: fullDescription || null,
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          stockQuantity: parseInt(stockQuantity) || 0,
          stockStatus: stockStatus || 'IN_STOCK',
          mainImageUrl: mainImageUrl || null,
          mainImageKey: mainImageKey || null,
          width: width ? parseFloat(width) : null,
          depth: depth ? parseFloat(depth) : null,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          notes: notes || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          isActive: isActive !== undefined ? isActive : true
        },
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
              slug: true
            }
          }
        }
      });

      // If product has a brand, increment the brand's nextProductNum
      if (brandId) {
        await tx.productBrand.update({
          where: { id: brandId },
          data: {
            nextProductNum: {
              increment: 1
            }
          }
        });
      }

      return product;
    });

    const product = result;

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
