'use client';

import { useState } from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomMenu from '../components/BottomMenu';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export default function CartPage() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';
  
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Premium T-krekls',
      price: 29.99,
      image: '/images/product-placeholder.jpg',
      quantity: 2,
      size: 'M',
      color: 'Melns'
    },
    {
      id: '2', 
      name: 'Sporta kurpes',
      price: 89.99,
      image: '/images/product-placeholder.jpg',
      quantity: 1,
      size: '42',
      color: 'Balts'
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <TopBar />
        <Header />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Iepirkumu grozs</h1>
            
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jūsu grozs ir tukšs</h2>
              <p className="text-gray-600 mb-8">Pievienojiet produktus, lai sāktu iepirkšanos</p>
              <Link
                href={`/${currentLocale}`}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <TopBar />
      <Header />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Iepirkumu grozs</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Produkti ({cartItems.length})
                </h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md bg-gray-100"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          {item.size && <span>Izmērs: {item.size}</span>}
                          {item.color && <span>Krāsa: {item.color}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="font-medium text-gray-900 w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-900">
                              €{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Pasūtījuma kopsavilkums
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Produkti ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Piegāde</span>
                  <span>{shipping === 0 ? 'Bezmaksas' : `€${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    🎉 Bezmaksas piegāde pasūtījumiem virs €50!
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Kopā</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-4">
                Turpināt uz apmaksu
              </button>
              
              <Link
                href={`/${currentLocale}`}
                className="block text-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Turpināt iepirkšanos
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
      <BottomMenu />
    </div>
  );
}