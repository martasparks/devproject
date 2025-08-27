'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronRightIcon, TruckIcon, CreditCardIcon, HeartIcon, UserIcon, PhoneIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCategories } from '../contexts/CategoriesContext';
import { SignInModal } from '@/components/signin-modal';

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
  const { categories, loading } = useCategories();
  const { data: session } = useSession();
  const [hasMounted, setHasMounted] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'categories' | 'subcategories'>('main');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [navigationStack, setNavigationStack] = useState<{title: string, view: string, category?: any}[]>([]);

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'lv';
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${langCode}`);
    router.push(newPath);
    onClose();
  };

  const handleNavigateToCategories = () => {
    setNavigationStack([{title: 'Kategorijas', view: 'main'}]);
    setCurrentView('categories');
  };

  const handleNavigateToSubcategories = (category: any) => {
    setNavigationStack([...navigationStack, {title: category.name, view: 'categories', category}]);
    setSelectedCategory(category);
    setCurrentView('subcategories');
  };

  const handleBack = () => {
    const newStack = [...navigationStack];
    newStack.pop();
    setNavigationStack(newStack);
    
    if (newStack.length === 0) {
      setCurrentView('main');
      setSelectedCategory(null);
    } else {
      const previousView = newStack[newStack.length - 1];
      if (previousView.view === 'main') {
        setCurrentView('categories');
      } else if (previousView.view === 'categories') {
        setCurrentView('subcategories');
        setSelectedCategory(previousView.category);
      }
    }
  };

  const handleCategoryClick = (category: any) => {
    router.push(`/${currentLocale}/mebeles/${category.slug}`);
    onClose();
  };

  const resetNavigation = () => {
    setCurrentView('main');
    setSelectedCategory(null);
    setNavigationStack([]);
  };

  // Reset navigation when closing
  const handleClose = () => {
    resetNavigation();
    onClose();
  };


  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Prevent body scroll when offcanvas is open
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      
      {/* Offcanvas Panel */}
      <div className="fixed inset-0 w-full h-full bg-white z-50 md:hidden flex flex-col overflow-hidden">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentView === 'main' ? (
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                        lang.code === currentLocale 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                  <span>Atpakaļ</span>
                </button>
              )}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {currentView === 'main' && (
            <>
              {/* Product Categories Entry */}
              <div>
                <button
                  onClick={handleNavigateToCategories}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">Preču kategorijas</span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </>
          )}

          {currentView === 'categories' && (
            <div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.children && cat.children.length > 0) {
                          handleNavigateToSubcategories(cat);
                        } else {
                          handleCategoryClick(cat);
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900">{cat.name}</span>
                      {cat.children && cat.children.length > 0 ? (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'subcategories' && selectedCategory && (
            <div>
              <div className="space-y-2">
                {/* Parent category option */}
                <button
                  onClick={() => handleCategoryClick(selectedCategory)}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-200"
                >
                  <span className="font-medium text-gray-900">Visas {selectedCategory.name}</span>
                </button>
                
                {/* Subcategories */}
                {selectedCategory.children?.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => handleCategoryClick(sub)}
                    className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-gray-900">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentView === 'main' && (
            <>
              {/* Quick Access Links */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Ātra piekļuve</h3>
                <div className="space-y-2">
                  <Link 
                    href={`/${currentLocale}/delivery`}
                    onClick={handleClose}
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <TruckIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Piegāde</span>
                  </Link>
                  
                  <Link 
                    href={`/${currentLocale}/payment`}
                    onClick={handleClose}
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <CreditCardIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Apmaksas veidi</span>
                  </Link>
                  
                  <Link 
                    href={`/${currentLocale}/wishlist`}
                    onClick={handleClose}
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HeartIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Vēlmju saraksts</span>
                  </Link>
                  
                  {!session?.user ? (
                    <SignInModal currentLocale={currentLocale}>
                      <div className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                        <span>Ienākt</span>
                      </div>
                    </SignInModal>
                  ) : (
                    <Link 
                      href={`/${currentLocale}/orders`}
                      onClick={handleClose}
                      className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                      <span>Pasūtījuma statuss</span>
                    </Link>
                  )}
                  
                  <Link 
                    href="tel:+37122722280"
                    onClick={handleClose}
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <span>+371 227 22280</span>
                  </Link>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}