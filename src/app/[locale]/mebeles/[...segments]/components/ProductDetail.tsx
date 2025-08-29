'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProductUrl } from '@/lib/product-utils';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  salePrice?: number;
  stockStatus: string;
  stockQuantity: number;
  mainImageUrl?: string;
  width?: number;
  depth?: number;
  height?: number;
  weight?: number;
  category: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
      parent?: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
    deliveryTime?: string;
    logoUrl?: string;
    description?: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
  }>;
}

interface ProductDetailProps {
  locale: string;
  product: Product;
}

export default function ProductDetail({ locale, product }: ProductDetailProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${product.category.slug}&limit=4`);
        
        if (response.ok) {
          const data = await response.json();
          // Filter out current product
          const related = data.products.filter((p: any) => p.id !== product.id);
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.category.slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }).format(price);
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const allImages = product.images.length > 0 ? product.images : 
    (product.mainImageUrl ? [{ id: 'main', imageUrl: product.mainImageUrl, altText: product.name }] : []);

  const getStockStatusInfo = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
          text: 'Noliktavā',
          color: 'text-green-600'
        };
      case 'LOW_STOCK':
        return {
          icon: <ClockIcon className="w-5 h-5 text-yellow-500" />,
          text: `Maz noliktavā (${product.stockQuantity})`,
          color: 'text-yellow-600'
        };
      case 'OUT_OF_STOCK':
        return {
          icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
          text: 'Nav noliktavā',
          color: 'text-red-600'
        };
      case 'PRE_ORDER':
        return {
          icon: <ClockIcon className="w-5 h-5 text-blue-500" />,
          text: 'Priekšpasūtījums',
          color: 'text-blue-600'
        };
      default:
        return {
          icon: <XCircleIcon className="w-5 h-5 text-gray-500" />,
          text: product.stockStatus,
          color: 'text-gray-600'
        };
    }
  };

  const stockInfo = getStockStatusInfo();

  // Build breadcrumb path
  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'Sākums', href: `/${locale}` },
      { name: 'Mēbeles', href: `/${locale}/mebeles` }
    ];

    // Add category hierarchy
    let currentCategory = product.category;
    const categoryPath = [];
    
    while (currentCategory) {
      categoryPath.unshift(currentCategory);
      currentCategory = currentCategory.parent;
    }

    let pathSoFar = '';
    categoryPath.forEach(cat => {
      pathSoFar += (pathSoFar ? '/' : '') + cat.slug;
      breadcrumbs.push({
        name: cat.name,
        href: `/${locale}/mebeles/${pathSoFar}`
      });
    });

    // Add current product
    breadcrumbs.push({
      name: product.name,
      href: getProductUrl(product, locale)
    });

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
            ) : (
              <Link href={breadcrumb.href} className="hover:text-gray-700">
                {breadcrumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {allImages.length > 0 ? (
              <Image
                src={allImages[selectedImageIndex]?.imageUrl}
                alt={allImages[selectedImageIndex]?.altText || product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CubeIcon className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {allImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Kods: {product.productCode}</span>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {product.brand && (
              <p className="text-lg text-gray-600 mb-4">
                Ražotājs: <span className="font-medium">{product.brand.name}</span>
              </p>
            )}

            {product.shortDescription && (
              <p className="text-gray-700 mb-4">{product.shortDescription}</p>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-b border-gray-200 py-6">
            <div className="flex items-center space-x-4 mb-4">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {stockInfo.icon}
              <span className={`font-medium ${stockInfo.color}`}>
                {stockInfo.text}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                  disabled={product.stockStatus === 'OUT_OF_STOCK'}
                >
                  +
                </button>
              </div>

              <Button 
                className="flex-1 h-12"
                disabled={product.stockStatus === 'OUT_OF_STOCK'}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                {product.stockStatus === 'OUT_OF_STOCK' ? 'Nav pieejams' : 'Pievienot grozam'}
              </Button>
            </div>

            {product.brand?.deliveryTime && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TruckIcon className="w-4 h-4" />
                <span>Piegāde: {product.brand.deliveryTime}</span>
              </div>
            )}
          </div>

          {/* Specifications */}
          {(product.width || product.depth || product.height || product.weight) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Specifikācijas</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {product.width && (
                  <>
                    <dt className="text-gray-600">Platums:</dt>
                    <dd className="text-gray-900">{product.width} cm</dd>
                  </>
                )}
                {product.depth && (
                  <>
                    <dt className="text-gray-600">Dziļums:</dt>
                    <dd className="text-gray-900">{product.depth} cm</dd>
                  </>
                )}
                {product.height && (
                  <>
                    <dt className="text-gray-600">Augstums:</dt>
                    <dd className="text-gray-900">{product.height} cm</dd>
                  </>
                )}
                {product.weight && (
                  <>
                    <dt className="text-gray-600">Svars:</dt>
                    <dd className="text-gray-900">{product.weight} kg</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Full Description */}
      {product.fullDescription && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Apraksts</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{product.fullDescription}</p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Līdzīgi produkti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
