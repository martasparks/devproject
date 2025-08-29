import { auth } from "@lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import ProductForm from "../../components/ProductForm";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  // Fetch the product and related data
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
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
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.category.findMany({
      include: {
        parent: true,
        children: {
          include: {
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.productBrand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        brandCode: true
      }
    })
  ]);

  if (!product) {
    notFound();
  }

  // Convert Decimal to number for the form
  const productData = {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    width: product.width ? Number(product.width) : undefined,
    depth: product.depth ? Number(product.depth) : undefined,
    height: product.height ? Number(product.height) : undefined,
    weight: product.weight ? Number(product.weight) : undefined,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeftIcon className="w-4 h-4" />
              Atpakaļ
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Labot produktu</h1>
            <p className="text-gray-600 mt-1">
              Rediģējiet produkta "{product.name}" informāciju
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm 
        product={productData}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
