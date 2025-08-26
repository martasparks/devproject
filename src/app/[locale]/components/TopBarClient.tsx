'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDownIcon, UserIcon, CogIcon, ArrowLeftEndOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { SignInModal } from '@/components/signin-modal';

const languages = [
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

interface TopBarClientProps {
  children: React.ReactNode;
}

export default function TopBarClient({ children }: TopBarClientProps) {
  const t = useTranslations('TopBar'); // Pievienojiet tulkojumus
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1] || 'lv';
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
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

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: `/${currentLocale}` });
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
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
                aria-label={t('languageSelector', { default: 'Valodas izvēle' })}
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

            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={t('userMenu', { default: 'Lietotāja izvēlne' })}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                  <span className="max-w-24 truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDownIcon className="w-3 h-3" />
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
                        {t('profile', { default: 'Mans profils' })}
                      </Link>
                      <Link
                        href={`/${currentLocale}/orders`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CogIcon className="w-4 h-4 mr-3" />
                        {t('orders', { default: 'Mani pasūtījumi' })}
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href={`/admin`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="w-4 h-4 mr-3" />
                          {t('adminPanel', { default: 'Admin panelis' })}
                        </Link>
                      )}
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-3" />
                        {t('signOut', { default: 'Izlogoties' })}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SignInModal currentLocale={currentLocale}>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t('signIn', { default: 'Ielogoties' })}
                </button>
              </SignInModal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
