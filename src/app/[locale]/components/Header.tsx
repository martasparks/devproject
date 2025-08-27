"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, ChevronDownIcon, CogIcon, ArrowLeftEndOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SignInModal } from '@/components/signin-modal';

interface Settings {
  [key: string]: {
    value: string;
    imageUrl: string | null;
  };
}

export default function Header() {
  const t = useTranslations('Header');
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data.settings || {});
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: `/${currentLocale}` });
  };
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={`/${currentLocale}`} className="flex items-center space-x-2">
            {loading ? (
              <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
            ) : settings.site_logo?.imageUrl ? (
              <Image
                src={settings.site_logo.imageUrl}
                alt={loading ? "Logo" : t('logoAlt')}
                width={120}
                height={40}
                className="h-14 w-auto object-contain"
                priority
              />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {settings.site_name?.value || (loading ? "Mēbeles" : t('defaultSiteName'))}
              </div>
            )}
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={loading ? "Meklēt..." : t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label={loading ? "Meklēt" : t('searchButton')}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <Link 
              href={`/${currentLocale}/wishlist`} 
              className="p-2 text-gray-600 hover:text-gray-900 relative"
              aria-label={loading ? "Vēlmes" : t('wishlistLink')}
            >
              <HeartIcon className="h-6 w-6" />
            </Link>

            {/* Shopping Cart */}
            <Link 
              href={`/${currentLocale}/cart`} 
              className="p-2 text-gray-600 hover:text-gray-900 relative"
              aria-label={loading ? "Grozs" : t('cartLink')}
            >
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>

            {/* Profile/User Menu */}
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={loading ? "Lietotāja izvēlne" : t('userMenu')}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href={`/${currentLocale}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 mr-3" />
                        {loading ? "Mans profils" : t('profile')}
                      </Link>
                      <Link
                        href={`/${currentLocale}/orders`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CogIcon className="w-4 h-4 mr-3" />
                        {loading ? "Mani pasūtījumi" : t('orders')}
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href={`/admin`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="w-4 h-4 mr-3" />
                          {loading ? "Admin panelis" : t('adminPanel')}
                        </Link>
                      )}
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-3" />
                        {loading ? "Izlogoties" : t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SignInModal currentLocale={currentLocale}>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <UserIcon className="w-6 h-6" />
                </button>
              </SignInModal>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}