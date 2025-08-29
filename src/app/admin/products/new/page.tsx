import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import ProductForm from "../components/ProductForm";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch categories and brands for the form
  const [categories, brands] = await Promise.all([
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
            <h1 className="text-3xl font-bold text-gray-900">Jauns produkts</h1>
            <p className="text-gray-600 mt-1">
              Pievienojiet jaunu produktu katalogam
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm 
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
