'use client';

import { useState, useEffect } from 'react';
import { 
  FolderIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import CategoryPlaceholder from '@/components/CategoryPlaceholder';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stockStatus: string;
  stockQuantity: number;
  mainImageUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
    deliveryTime?: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface CategoryContentProps {
  locale: string;
  categoryPath: string;
  initialCategory?: Category;
}

export default function CategoryContent({ locale, categoryPath, initialCategory }: CategoryContentProps) {
  const [currentCategory, setCurrentCategory] = useState<Category | null>(initialCategory || null);
  const [loading, setLoading] = useState(!initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get category slug from path (last segment)
  const categorySlug = categoryPath.split('/').pop() || '';

  // Fetch current category data only if not provided initially
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/categories/${categorySlug}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentCategory(data.category);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && !initialCategory) {
      fetchCategory();
    }
  }, [categorySlug, initialCategory]);

  // Fetch products for leaf categories
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentCategory || (currentCategory.children && currentCategory.children.length > 0)) {
        return; // Don't fetch products if category has children
      }

      // Check if category has any products at all using _count from category API
      if (currentCategory._count && currentCategory._count.products === 0) {
        // Skip products fetch if category is empty
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        setProductsLoading(false);
        return;
      }

      setProductsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('category', categorySlug);
        params.set('page', currentPage.toString());
        params.set('limit', '12');

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
          setTotalCount(data.pagination.totalCount);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, currentCategory, currentPage]);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Kategorija nav atrasta
          </h3>
          <p className="text-gray-600">
            Pieprasītā kategorija neeksistē.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Subcategories Grid - Show if category has children */}
      {currentCategory.children && currentCategory.children.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Izvēlieties kategoriju</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Atklājiet mūsu plašo mēbeļu klāstu - no klasiskajiem līdz modernajiem dizainiem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategory.children.map((subCategory, index) => (
              <Link
                key={subCategory.id}
                href={`/${locale}/mebeles/${categoryPath}/${subCategory.slug}`}
                className="group relative block"
              >
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {subCategory.imageUrl ? (
                      <Image
                        src={subCategory.imageUrl}
                        alt={subCategory.name}
                        width={500}
                        height={375}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <CategoryPlaceholder 
                        name={subCategory.name}
                        size="md"
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    
                    {/* Simple Corner Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clean Content Area */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {subCategory.name}
                        </h3>
                        {subCategory.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {subCategory.description}
                          </p>
                        )}
                        {/* Product count */}
                        {subCategory._count && (
                          <p className="text-sm text-gray-500 mt-1">
                            {subCategory._count.products} {subCategory._count.products === 1 ? 'produkts' : 'produkti'}
                          </p>
                        )}
                      </div>
                      
                      {/* Subtle Arrow */}
                      <div className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200">
                        <ChevronRightIcon className="w-5 h-5 transform rotate-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid - Only show if no subcategories or if this is a leaf category */}
      {(!currentCategory.children || currentCategory.children.length === 0) && (
        <>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Iepriekšējā
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      if (page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Nākamā
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nav produktu
              </h3>
              <p className="text-gray-600">
                Šajā kategorijā vēl nav pievienoti produkti.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
