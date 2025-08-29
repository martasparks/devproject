'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import CategoryPlaceholder from '@/components/CategoryPlaceholder';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
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

interface CategoryContentProps {
  locale: string;
  slug: string;
}

export default function CategoryContent({ locale, slug }: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/categories/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Kategorija nav atrasta');
          } else {
            throw new Error('Neizdevās ielādēt kategoriju');
          }
          return;
        }
        
        const data = await response.json();
        setCategory(data.category);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Neizdevās ielādēt kategoriju');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  // Fetch products for the category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      
      // Don't fetch products if category has children (subcategories)
      if (category.children && category.children.length > 0) {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        setProductsLoading(false);
        return;
      }
      
      try {
        setProductsLoading(true);
        
        const params = new URLSearchParams({
          category: slug,
          sortBy,
          sortOrder,
          page: currentPage.toString(),
          limit: '12'
        });
        
        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) {
          throw new Error('Neizdevās ielādēt produktus');
        }
        
        const data = await response.json();
        setProducts(data.products);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Neizdevās ielādēt produktus');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [category, slug, sortBy, sortOrder, currentPage]);

  const toggleWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist for product:', productId);
  };

  const addToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product.name);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-');
    setSortBy(sort);
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>

          {/* Title skeleton */}
          <div className="w-48 h-8 bg-gray-200 animate-pulse rounded mb-8"></div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-1/2 h-6 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kļūda</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Atgriezties uz sākumu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kategorija nav atrasta</h2>
            <p className="text-gray-600 mb-6">Mēģiniet meklēt citu kategoriju</p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Atgriezties uz sākumu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href={`/${locale}`} className="hover:text-gray-900">
            Sākums
          </Link>
          <ChevronDownIcon className="w-4 h-4 rotate-[-90deg]" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            <p className="text-gray-600">
              {category.children && category.children.length > 0 
                ? `${category.children.length} ${category.children.length === 1 ? 'apakškategorija' : 'apakškategorijas'}`
                : `${totalCount} ${totalCount === 1 ? 'produkts' : totalCount < 5 ? 'produkti' : 'produktu'}`
              }
            </p>
          </div>

          {/* Controls - Only show if no subcategories */}
          {(!category.children || category.children.length === 0) && (
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Jaunākie</option>
                <option value="price-asc">Cena: zemāka → augstāka</option>
                <option value="price-desc">Cena: augstāka → zemāka</option>
                <option value="name-asc">Nosaukums: A → Z</option>
                <option value="name-desc">Nosaukums: Z → A</option>
              </select>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filtri</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel - Only show if no subcategories */}
        {showFilters && (!category.children || category.children.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Filtri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-2">Cenas diapazons</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="No"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Līdz"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="font-medium mb-2">Zīmols</h4>
                <div className="space-y-2">
                  {['IKEA', 'Home24', 'Jysk', 'Custom'].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-medium mb-2">Pieejamība</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Noliktavā</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Pēc pasūtījuma</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories Grid - Show if category has children */}
        {category.children && category.children.length > 0 ? (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Izvēlieties apakškategoriju</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Atklājiet mūsu plašo {category.name.toLowerCase()} klāstu
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.children.map((subCategory, index) => (
                <Link
                  key={subCategory.id}
                  href={`/${locale}/mebeles/${category.slug}/${subCategory.slug}`}
                  className="group relative block"
                >
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                    {/* Image Container */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {subCategory.imageUrl ? (
                        <img
                          src={subCategory.imageUrl}
                          alt={subCategory.name}
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
                          {/* Product count */}
                          {subCategory._count && (
                            <p className="text-sm text-gray-500 mt-1">
                              {subCategory._count.products} {subCategory._count.products === 1 ? 'produkts' : 'produkti'}
                            </p>
                          )}
                        </div>
                        
                        {/* Subtle Arrow */}
                        <div className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200">
                          <ChevronDownIcon className="w-5 h-5 transform rotate-[-90deg]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid/List - Only show if no subcategories */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-1/2 h-6 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => {
                const mainImage = product.images?.[0]?.imageUrl || product.mainImageUrl || '/images/product-placeholder.jpg';
                const isInStock = product.stockStatus !== 'OUT_OF_STOCK';
                const hasDiscount = product.salePrice && product.salePrice < product.price;
                const displayPrice = hasDiscount ? product.salePrice! : product.price;
                const originalPrice = hasDiscount ? product.price : null;
                
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={mainImage}
                        alt={product.name}
                        className={`object-cover bg-gray-100 ${
                          viewMode === 'list' ? 'w-full h-48' : 'w-full h-64'
                        }`}
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            -{Math.round(((originalPrice! - displayPrice) / originalPrice!) * 100)}%
                          </span>
                        </div>
                      )}

                      {/* Stock Status */}
                      {!isInStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Nav noliktavā</span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <HeartIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <h3 className={`font-medium text-gray-900 mb-2 ${viewMode === 'list' ? 'text-lg' : 'line-clamp-2'}`}>
                          {product.name}
                        </h3>

                        {/* Brand */}
                        {product.brand && (
                          <p className="text-sm text-gray-600 mb-2">{product.brand.name}</p>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-xl font-bold text-gray-900">
                            €{displayPrice.toFixed(2)}
                          </span>
                          {originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              €{originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`space-y-2 ${viewMode === 'list' ? 'flex space-y-0 space-x-2' : ''}`}>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={!isInStock}
                          className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                            isInStock
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBagIcon className="w-4 h-4" />
                          <span>{isInStock ? 'Pievienot grozam' : 'Nav pieejams'}</span>
                        </button>

                        <Link
                          href={`/${locale}/mebeles/${product.slug}`}
                          className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} block text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`}
                        >
                          Apskatīt
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {currentPage < totalPages && (
              <div className="text-center mt-12">
                <button 
                  onClick={loadMore}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ielādēt vēl
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nav produktu</h2>
            <p className="text-gray-600 mb-6">
              Šajā kategorijā nav pieejamu produktu. Mēģiniet apskatīt citas kategorijas.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Atgriezties uz sākumu
            </Link>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}