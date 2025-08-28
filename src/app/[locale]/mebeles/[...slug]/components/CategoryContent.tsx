'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
  parent?: Category;
  breadcrumbs?: Category[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isWishlisted: boolean;
}

interface CategoryContentProps {
  locale: string;
  categoryPath: string;
}

export default function CategoryContent({ locale, categoryPath }: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Generate correct nested breadcrumb URL
  const getBreadcrumbUrl = (breadcrumbs: Category[], targetIndex: number) => {
    const pathSegments = breadcrumbs.slice(0, targetIndex + 1).map(b => b.slug);
    return `/${locale}/mebeles/${pathSegments.join('/')}`;
  };

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Always use the last segment to find the category
        const lastSegment = categoryPath.split('/').pop();
        const response = await fetch(`/api/categories/${lastSegment}`);
        if (!response.ok) throw new Error('Category not found');
        
        const data = await response.json();
        setCategory(data.category);
        
        // Products will be loaded when available - for now empty array
        setProducts([]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching category:', error);
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryPath]);

  const toggleWishlist = (productId: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, isWishlisted: !product.isWishlisted }
          : product
      )
    );
  };

  const addToCart = (product: Product) => {
    alert(`${product.name} pievienots grozam!`);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>

          <div className="w-48 h-8 bg-gray-200 animate-pulse rounded mb-8"></div>

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

  if (!category) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategorija nav atrasta</h1>
          <p className="text-gray-600 mb-8">Meklētā kategorija neeksistē vai ir pagaidu nepieejama.</p>
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Atgriezties uz sākumu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href={`/${locale}`} className="hover:text-gray-900">
            Sākums
          </Link>
          
          {category?.breadcrumbs?.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              <ChevronDownIcon className="w-4 h-4 rotate-[-90deg]" />
              <Link 
                href={getBreadcrumbUrl(category.breadcrumbs!, index)} 
                className="hover:text-gray-900"
              >
                {breadcrumb.name}
              </Link>
            </React.Fragment>
          ))}
          
          <ChevronDownIcon className="w-4 h-4 rotate-[-90deg]" />
          <span className="text-gray-900 font-medium">{category?.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name}</h1>
            <p className="text-gray-600">
              {products.length > 0 ? `${products.length} produkti` : 'Produkti drīzumā tiks pievienoti'}
            </p>
          </div>

          {products.length > 0 && (
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Jaunākie</option>
              <option value="price-low">Cena: zemāka &rarr; augstāka</option>
              <option value="price-high">Cena: augstāka &rarr; zemāka</option>
              <option value="rating">Populārākie</option>
            </select>

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

        {showFilters && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Filtri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div>
                <h4 className="font-medium mb-2">Zīmols</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Ražotāji tiks rādīti, kad produkti būs pievienoti</p>
                </div>
              </div>

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

        {products.length > 0 ? (
          <><div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'}>
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`object-cover bg-gray-100 ${viewMode === 'list' ? 'w-full h-48' : 'w-full h-64'}`} />

                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Nav noliktavā</span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {product.isWishlisted ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className={`font-medium text-gray-900 mb-2 ${viewMode === 'list' ? 'text-lg' : 'line-clamp-2'}`}>
                      {product.name}
                    </h3>

                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : star - 0.5 <= product.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        €{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          €{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`space-y-2 ${viewMode === 'list' ? 'flex space-y-0 space-x-2' : ''}`}>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${product.inStock
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>{product.inStock ? 'Pievienot grozam' : 'Nav pieejams'}</span>
                    </button>

                    <Link
                      href={`/${locale}/product/${product.id}`}
                      className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} block text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`}
                    >
                      Apskatīt
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div><div className="text-center mt-12">
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Ielādēt vēl
              </button>
            </div></>
        ) : (
          <>
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21V9l6-2v10"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Produkti vēl nav pievienoti</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Šajā kategorijā produkti tiks pievienoti tuvākajā laikā. Lūdzu apmeklējiet mūs vēlāk vai aplūkojiet citas kategorijas.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Atgriezties uz sākumu
            </Link>
          </div>
          </>
        )}
      </div>
    </div>
  );
}