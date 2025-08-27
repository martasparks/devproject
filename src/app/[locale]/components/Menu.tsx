"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "../contexts/CategoriesContext";

interface MenuProps {
  mobile?: boolean;
}

export default function Menu({ mobile = false }: MenuProps) {
  const { categories, loading } = useCategories();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="max-w-screen-2xl mx-auto px-4 flex space-x-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-6 py-3">
              <div className="w-16 h-4 bg-slate-200/60 animate-pulse rounded-full"></div>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  if (mobile) {
    return (
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-1">
            <Link 
              href={`/${currentLocale}/mebeles/${cat.slug}`}
              className="flex items-center justify-between px-4 py-3 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
            >
              <span>{cat.name}</span>
              {cat.children && cat.children.length > 0 && (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
            
            {cat.children && cat.children.length > 0 && (
              <div className="ml-4 space-y-1">
                {cat.children.map((sub) => (
                  <Link 
                    key={sub.id}
                    href={`/${currentLocale}/mebeles/${sub.slug}`}
                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/30 rounded-lg transition-all duration-200"
                  >
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/60">
      <div className="max-w-screen-2xl mx-auto px-4 flex space-x-1">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            <Link 
              href={`/${currentLocale}/mebeles/${cat.slug}`}
              className="inline-flex items-center px-6 py-4 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 rounded-lg mx-1 relative group"
            >
              <span className="relative z-10">{cat.name}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              {cat.children && cat.children.length > 0 && (
                <svg className="ml-2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </Link>
            
            {cat.children && cat.children.length > 0 && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-20">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 py-3 min-w-56 backdrop-blur-sm">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200/60 rotate-45"></div>
                  
                  <div className="space-y-1 px-2">
                    {cat.children.map((sub, subIndex) => (
                      <Link 
                        key={sub.id}
                        href={`/${currentLocale}/mebeles/${sub.slug}`}
                        className="flex items-center px-4 py-3 text-sm text-slate-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 group/sub"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mr-3 opacity-60 group-hover/sub:opacity-100 transition-opacity duration-200"></div>
                        <span>{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}