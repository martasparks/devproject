'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  HomeIcon, 
  UserIcon, 
  HeartIcon, 
  ShoppingBagIcon, 
  Bars3Icon,
  ShieldCheckIcon,
  ArrowLeftEndOnRectangleIcon
} from '@heroicons/react/24/outline';
import MobileOffcanvas from './MobileOffcanvas';

export default function BottomMenu() {
  const { data: session } = useSession();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="grid grid-cols-5 py-2">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center py-2 px-1">
            <HomeIcon className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Sākums</span>
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className="flex flex-col items-center py-2 px-1">
            <HeartIcon className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Vēlmes</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="flex flex-col items-center py-2 px-1">
            <ShoppingBagIcon className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Grozs</span>
          </Link>

          {/* Profile */}
          <div className="relative">
            {session?.user ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex flex-col items-center py-2 px-1 w-full"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-600" />
                )}
                <span className="text-xs text-gray-600 mt-1">Profils</span>
              </button>
            ) : (
              <Link href="/signin" className="flex flex-col items-center py-2 px-1">
                <UserIcon className="w-6 h-6 text-gray-600" />
                <span className="text-xs text-gray-600 mt-1">Ieiet</span>
              </Link>
            )}

            {/* Profile Menu */}
            {showProfileMenu && session?.user && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-25 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                      {session.user.name || session.user.email}
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      Mans profils
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <ShoppingBagIcon className="w-4 h-4 mr-3" />
                      Mani pasūtījumi
                    </Link>
                    
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <ShieldCheckIcon className="w-4 h-4 mr-3" />
                        Admin panelis
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-3" />
                      Izlogoties
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Menu */}
          <button
            onClick={() => setIsOffcanvasOpen(true)}
            className="flex flex-col items-center py-2 px-1"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Izvēlne</span>
          </button>
        </div>
      </div>

      {/* Mobile Offcanvas */}
      <MobileOffcanvas 
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
      />
    </>
  );
}