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

    const product = await prisma.product.findUnique({
      where: { id },
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
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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

    // Check if product code already exists (excluding current product)
    if (productCode !== existingProduct.productCode) {
      const productWithCode = await prisma.product.findUnique({
        where: { productCode }
      });

      if (productWithCode) {
        return NextResponse.json(
          { error: 'Product with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Check if slug already exists (excluding current product)
    if (slug !== existingProduct.slug) {
      const productWithSlug = await prisma.product.findUnique({
        where: { slug }
      });

      if (productWithSlug) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 409 }
        );
      }
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

    const updatedProduct = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product (this will also delete related images due to CASCADE)
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
