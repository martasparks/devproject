'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

const languages = [
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

interface TopBarClientProps {
  children: React.ReactNode;
}

export default function TopBarClient({ children }: TopBarClientProps) {
  const t = useTranslations('TopBar');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1] || 'lv';
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Uzlabota valodu maiņas loģika
    const segments = pathname.split('/');
    
    // Ja pašreizējais locale ir URL pirmajā segmentā
    if (languages.some(lang => lang.code === segments[1])) {
      segments[1] = langCode;
    } else {
      // Ja nav locale URL, pievienojiet jauno locale
      segments.splice(1, 0, langCode);
    }
    
    const newPath = segments.join('/') || '/';
    
    console.log('Current pathname:', pathname);
    console.log('New path:', newPath);
    
    router.push(newPath);
    setIsLangMenuOpen(false);
  };


  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-10 text-sm">
          <div className="flex-1 overflow-x-auto scrollbar-gutter-stable pb-3 pt-3">
            <div className="flex items-center space-x-4 whitespace-nowrap">
              {children}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label={t('languageSelector', { default: 'Izvēlies valodu' })}
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDownIcon className="w-3 h-3" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 transition-colors ${
                          lang.code === currentLocale ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
