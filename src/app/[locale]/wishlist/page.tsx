'use client';

import { useState } from 'react';
import { HeartIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomMenu from '../components/BottomMenu';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export default function WishlistPage() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Premium T-krekls ar garām piedurknēm',
      price: 29.99,
      originalPrice: 39.99,
      image: '/images/product-placeholder.jpg',
      inStock: true,
      rating: 4.5,
      reviewCount: 124
    },
    {
      id: '2',
      name: 'Sporta kurpes ar gaisa spilveniem',
      price: 89.99,
      image: '/images/product-placeholder.jpg',
      inStock: true,
      rating: 4.8,
      reviewCount: 89
    },
    {
      id: '3',
      name: 'Eleganta kleita īpašiem gadījumiem',
      price: 159.99,
      originalPrice: 199.99,
      image: '/images/product-placeholder.jpg',
      inStock: false,
      rating: 4.2,
      reviewCount: 45
    }
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // Cart functionality would be implemented here
    alert(`${item.name} pievienots grozam!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <TopBar />
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Vēlmju saraksts</h1>
            
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jūsu vēlmju saraksts ir tukšs</h2>
              <p className="text-gray-600 mb-8">Pievienojiet produktus, kas jums patīk, lai tos vēlāk varētu iegādāties</p>
              <Link
                href={`/${currentLocale}`}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sākt iepirkšanos
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <TopBar />
      <Header />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Vēlmju saraksts</h1>
            <p className="text-gray-600">{wishlistItems.length} produkti</p>
          </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover bg-gray-100"
                />
                
                {/* Discount Badge */}
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
                
                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">Nav noliktavā</span>
                  </div>
                )}
                
                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                  {item.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(item.rating)
                            ? 'text-yellow-400 fill-current'
                            : star - 0.5 <= item.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({item.reviewCount})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    €{item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      €{item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                      item.inStock
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>{item.inStock ? 'Pievienot grozam' : 'Nav pieejams'}</span>
                  </button>
                  
                  <Link
                    href={`/${currentLocale}/product/${item.id}`}
                    className="w-full block text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Apskatīt detaļas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            href={`/${currentLocale}`}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Turpināt iepirkšanos
          </Link>
        </div>
        </div>
      </div>
      <Footer />
      <BottomMenu />
    </div>
  );
}