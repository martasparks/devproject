import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brandId } = body;

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    // Get the brand with its current nextProductNum
    const brand = await prisma.productBrand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Generate product code: BRANDCODE-XXX (e.g., SND-001)
    const productCode = `${brand.brandCode}-${brand.nextProductNum.toString().padStart(3, '0')}`;

    // Check if this product code already exists (safety check)
    const existingProduct = await prisma.product.findUnique({
      where: { productCode }
    });

    if (existingProduct) {
      // If somehow the code exists, increment and try again
      const updatedBrand = await prisma.productBrand.update({
        where: { id: brandId },
        data: { nextProductNum: brand.nextProductNum + 1 }
      });
      
      const newProductCode = `${brand.brandCode}-${updatedBrand.nextProductNum.toString().padStart(3, '0')}`;
      
      return NextResponse.json({
        productCode: newProductCode,
        brandCode: brand.brandCode,
        nextNum: updatedBrand.nextProductNum
      });
    }

    return NextResponse.json({
      productCode,
      brandCode: brand.brandCode,
      nextNum: brand.nextProductNum
    });
  } catch (error) {
    console.error('Error generating product code:', error);
    return NextResponse.json(
      { error: 'Failed to generate product code' },
      { status: 500 }
    );
  }
}
