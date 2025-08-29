"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "../contexts/CategoriesContext";
import { getCategoryUrl } from "@lib/categories";
import { ChevronDownIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface MenuProps {
  mobile?: boolean;
}

export default function Menu({ mobile = false }: MenuProps) {
  const { categories, loading } = useCategories();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';

  if (loading) {
    return (
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-screen-3xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center h-16 space-x-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" style={{ width: `${60 + index * 20}px` }}></div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  if (mobile) {
    return (
      <div className="space-y-1 p-4">
        {/* Products Link */}


        {categories.map((cat, index) => (
          <div key={cat.id} className="space-y-1">
            <Link 
              href={getCategoryUrl(cat, currentLocale)}
              className="group flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r ${
                  index % 4 === 0 ? 'from-red-400 to-pink-500' :
                  index % 4 === 1 ? 'from-blue-400 to-indigo-500' :
                  index % 4 === 2 ? 'from-green-400 to-emerald-500' :
                  'from-yellow-400 to-orange-500'
                }`}></div>
                <span>{cat.name}</span>
              </div>
              {cat.children && cat.children.length > 0 && (
                <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-white/80 transition-colors duration-300" />
              )}
            </Link>
            
            {cat.children && cat.children.length > 0 && (
              <div className="ml-6 space-y-1 pl-4 border-l-2 border-gray-100">
                {cat.children.map((sub, subIndex) => (
                  <div key={sub.id} className="space-y-1">
                    <Link 
                      href={getCategoryUrl(sub, currentLocale)}
                      className="group flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-400 hover:to-purple-500 rounded-lg transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 bg-gradient-to-r ${
                          subIndex % 3 === 0 ? 'from-blue-300 to-blue-500' :
                          subIndex % 3 === 1 ? 'from-green-300 to-green-500' :
                          'from-purple-300 to-purple-500'
                        }`}></div>
                        <span>{sub.name}</span>
                      </div>
                      {sub.children && sub.children.length > 0 && (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-white/80 transition-colors duration-300" />
                      )}
                    </Link>
                    
                    {sub.children && sub.children.length > 0 && (
                      <div className="ml-4 space-y-1 pl-3 border-l border-gray-100">
                        {sub.children.map((third) => (
                          <Link 
                            key={third.id}
                            href={getCategoryUrl(third, currentLocale)}
                            className="flex items-center px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-600 rounded-lg transition-all duration-300"
                          >
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mr-3"></div>
                            <span>{third.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-screen-3xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-center h-16 space-x-2">


          {categories.map((cat, index) => (
            <div key={cat.id} className="relative group">
              <Link 
                href={getCategoryUrl(cat, currentLocale)}
                className="group relative inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-white rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                  index % 4 === 0 ? 'from-purple-500 to-pink-500' :
                  index % 4 === 1 ? 'from-blue-500 to-cyan-500' :
                  index % 4 === 2 ? 'from-emerald-500 to-teal-500' :
                  'from-orange-500 to-red-500'
                }`}></div>
                <div className="relative flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                    index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                    index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                    index % 4 === 2 ? 'from-emerald-400 to-teal-400' :
                    'from-orange-400 to-red-400'
                  }`}></div>
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronDownIcon className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:rotate-180" />
                  )}
                </div>
              </Link>
              
              {cat.children && cat.children.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-4 min-w-72 max-w-sm">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 border-l border-t border-gray-200/50 rotate-45"></div>
                    
                    <div className="px-4 mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat.name}</h3>
                    </div>
                    
                    <div className="space-y-1 px-2">
                      {cat.children.map((sub, subIndex) => (
                        <div key={sub.id} className="relative group/sub">
                          <Link 
                            href={getCategoryUrl(sub, currentLocale)}
                            className="group/sub-link flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${
                                subIndex % 3 === 0 ? 'from-blue-400 to-indigo-500' :
                                subIndex % 3 === 1 ? 'from-green-400 to-emerald-500' :
                                'from-purple-400 to-pink-500'
                              }`}></div>
                              <span>{sub.name}</span>
                            </div>
                            {sub.children && sub.children.length > 0 && (
                              <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover/sub-link:text-white/80 transition-colors duration-300 -rotate-90" />
                            )}
                          </Link>
                          
                          {sub.children && sub.children.length > 0 && (
                            <div className="absolute left-full top-0 ml-3 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 ease-out">
                              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-3 min-w-60">
                                <div className="absolute -left-2 top-4 w-4 h-4 bg-white/95 border-l border-t border-gray-200/50 rotate-[-45deg]"></div>
                                
                                <div className="px-3 mb-2">
                                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{sub.name}</h4>
                                </div>
                                
                                <div className="space-y-1 px-2">
                                  {sub.children.map((third, thirdIndex) => (
                                    <Link 
                                      key={third.id}
                                      href={getCategoryUrl(third, currentLocale)}
                                      className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-700 rounded-xl transition-all duration-300"
                                    >
                                      <div className={`w-2 h-2 rounded-full mr-3 bg-gradient-to-r ${
                                        thirdIndex % 2 === 0 ? 'from-gray-400 to-gray-600' : 'from-slate-400 to-slate-600'
                                      }`}></div>
                                      <span>{third.name}</span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}