import prisma from '@lib/prisma';

/**
 * Generates the next product code for a brand
 * Format: BRAND_CODE-XXX (e.g., GOO-001, FB-042)
 */
export async function generateProductCode(brandId: string): Promise<string> {
  const brand = await prisma.productBrand.findUnique({
    where: { id: brandId },
    select: { brandCode: true, nextProductNum: true }
  });

  if (!brand) {
    throw new Error('Brand not found');
  }

  // Format: BRAND_CODE-XXX with zero padding
  const productNum = brand.nextProductNum.toString().padStart(3, '0');
  const productCode = `${brand.brandCode}-${productNum}`;

  // Update the next product number for this brand
  await prisma.productBrand.update({
    where: { id: brandId },
    data: { nextProductNum: { increment: 1 } }
  });

  return productCode;
}

/**
 * Validates if a brand code is available
 */
export async function isBrandCodeAvailable(brandCode: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.productBrand.findFirst({
    where: {
      brandCode: brandCode.toUpperCase(),
      ...(excludeId && { id: { not: excludeId } })
    }
  });

  return !existing;
}

/**
 * Formats brand code to uppercase and removes invalid characters
 */
export function formatBrandCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove non-alphanumeric characters
    .slice(0, 10); // Limit to 10 characters
}

/**
 * Gets the next available product number for a brand
 */
export async function getNextProductNumber(brandId: string): Promise<number> {
  const brand = await prisma.productBrand.findUnique({
    where: { id: brandId },
    select: { nextProductNum: true }
  });

  return brand?.nextProductNum || 1;
}

/**
 * Creates a new product with auto-generated product code
 */
export async function createProductWithCode(data: {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  price: number;
  shortDescription?: string;
  fullDescription?: string;
  salePrice?: number;
  stockQuantity?: number;
  // ... other product fields
}) {
  // Generate product code
  const productCode = await generateProductCode(data.brandId);

  // Create the product
  const product = await prisma.product.create({
    data: {
      ...data,
      productCode,
    },
    include: {
      brand: true,
      category: true,
      images: true,
    }
  });

  return product;
}