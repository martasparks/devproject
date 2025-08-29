'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CubeIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  stockStatus: string;
  mainImageUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
  }>;
}

export default function FeaturedProducts() {
  const t = useTranslations('FeaturedProducts');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products (latest products in stock)
        const response = await fetch('/api/products?limit=4&sortBy=createdAt&sortOrder=desc');
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          console.error('Failed to fetch featured products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            {t('title', { default: 'Populārākie produkti' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-4"></div>
                <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="w-24 h-6 bg-gray-200 rounded mx-auto mb-4"></div>
                <div className="w-full h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            {t('title', { default: 'Populārākie produkti' })}
          </h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CubeIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t('noProductsTitle', { default: 'Nav produktu' })}
            </h4>
            <p className="text-gray-600">
              {t('noProductsMessage', { default: 'Šobrīd nav pieejamu produktu. Lūdzu pārbaudiet vēlāk.' })}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">
          {t('title', { default: 'Populārākie produkti' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const mainImage = product.images?.[0]?.imageUrl || product.mainImageUrl;
            const isInStock = product.stockStatus !== 'OUT_OF_STOCK';
            const hasDiscount = product.salePrice && product.salePrice < product.price;
            const displayPrice = hasDiscount ? product.salePrice! : product.price;
            const originalPrice = hasDiscount ? product.price : null;

            return (
              <div key={product.id} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                      <CubeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h4>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(displayPrice)}
                  </p>
                  {originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(originalPrice)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/${currentLocale}/mebeles/${product.slug}`}
                  className={`block w-full px-6 py-2 rounded-lg transition-colors ${
                    isInStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isInStock 
                    ? t('viewButton', { default: 'Apskatīt' })
                    : t('outOfStock', { default: 'Nav pieejams' })
                  }
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}