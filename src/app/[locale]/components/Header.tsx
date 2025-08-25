"use client";

import Link from "next/link";
import { useState } from "react";
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CartIcon from "@/components/ui/CartIcon";
import CartDrawer from "@/components/ui/CartDrawer";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">🛒 E-Veikals</div>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Meklēt produktus..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <HeartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Shopping Cart */}
            <CartIcon onClick={() => setIsCartOpen(true)} />
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}