"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCategories } from "../contexts/CategoriesContext";
import CategoryPlaceholder from "@/components/CategoryPlaceholder";

export default function Categories() {
  const t = useTranslations('Categories');
  const { categories: allCategories, loading } = useCategories();
  const categories = allCategories.slice(0, 6);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';
  
  return (
    <section className="py-16">
      <div className="max-w-screen-2xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">
          {t('title', { default: 'Populārās kategorijas' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 animate-pulse rounded mx-auto mb-4"></div>
                <div className="w-32 h-6 bg-gray-200 animate-pulse rounded mx-auto mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mx-auto"></div>
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category, index) => (
              <Link 
                key={category.id} 
                href={`/${currentLocale}/mebeles/${category.slug}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer block group"
              >
                <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <CategoryPlaceholder 
                      name={category.name} 
                      size="lg"
                      className="rounded-lg"
                    />
                  )}
                </div>
                <h4 className="text-xl font-semibold mb-2">{category.name}</h4>
                <p className="text-gray-600">
                  {t('viewCategory', { default: 'Apskatīt kategoriju' })}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              {t('noCategories', { default: 'Nav pievienotu kategoriju' })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}