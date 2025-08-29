import Link from 'next/link';
import Image from 'next/image';
import { CubeIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getProductUrl } from '@/lib/product-utils';

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

interface ProductCardProps {
  product: Product;
  className?: string;
  locale?: string;
}

export default function ProductCard({ product, className = '', locale = 'lv' }: ProductCardProps) {
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }).format(price);
  };

  // Get stock status badge
  const getStockStatusBadge = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            IR NOLIKTAVĀ
          </span>
        );
      case 'MANUFACTURER_DELIVERY':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Piegāde no Ražotāja
          </span>
        );
      default:
        return null;
    }
  };

  const imageUrl = product.mainImageUrl || product.images[0]?.imageUrl;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors">
        <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
      </button>

      {/* Product Image */}
      <Link href={getProductUrl(product, locale)} className="block">
        <div className="aspect-square w-full bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CubeIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <Link 
            href={`/${locale}/mebeles/${product.category.slug}`}
            className="hover:text-gray-700"
          >
            {product.category.name}
          </Link>
          {product.brand && (
            <span>{product.brand.name}</span>
          )}
        </div>

        {/* Product Name */}
        <Link href={getProductUrl(product, locale)}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Stock Status */}
        <div className="mb-3">
          {getStockStatusBadge()}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Delivery Time */}
        {product.brand?.deliveryTime && (
          <div className="text-xs text-gray-500 mb-3">
            Piegāde: {product.brand.deliveryTime}
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          disabled={product.stockStatus === 'MANUFACTURER_DELIVERY'}
        >
          <ShoppingCartIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {product.stockStatus === 'MANUFACTURER_DELIVERY' ? 'Piegāde no Ražotāja' : 'Pievienot grozam'}
          </span>
        </button>
      </div>
    </div>
  );
}
