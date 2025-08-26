"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Menu from "./Menu";

interface Settings {
  [key: string]: {
    value: string;
    imageUrl: string | null;
  };
}

export default function Header() {
  const t = useTranslations('Header');
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={`/${currentLocale}`} className="flex items-center space-x-2">
            {loading ? (
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : settings.site_logo?.imageUrl ? (
              <Image
                src={settings.site_logo.imageUrl}
                alt={t('logoAlt')}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {settings.site_name?.value || t('defaultSiteName')}
              </div>
            )}
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={t('menuButton')}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Mobile Search */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label={t('searchButton')}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <Link 
              href={`/${currentLocale}/wishlist`} 
              className="p-2 text-gray-600 hover:text-gray-900 relative"
              aria-label={t('wishlistLink')}
            >
              <HeartIcon className="h-6 w-6" />
            </Link>

            {/* Shopping Cart */}
            <Link 
              href={`/${currentLocale}/cart`} 
              className="p-2 text-gray-600 hover:text-gray-900 relative"
              aria-label={t('cartLink')}
            >
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="border-t border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:block">
            <Menu />
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-white border-t border-slate-200/60">
              <div className="py-4">
                <Menu mobile={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}