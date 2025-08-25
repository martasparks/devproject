'use client';

import { Fragment } from 'react';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';

interface MobileOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function MobileOffcanvas({ isOpen, onClose }: MobileOffcanvasProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'lv';
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${langCode}`);
    router.push(newPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Offcanvas Panel */}
      <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Izvēlne</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Language Switcher */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Valoda</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    lang.code === currentLocale 
                      ? 'border-blue-200 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {lang.code === currentLocale && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Ātrie linki</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  router.push('/signin');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">Ielogoties</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  router.push('/register');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">Reģistrēties</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}