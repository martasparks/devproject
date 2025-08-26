"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "../contexts/CategoriesContext";

// Default category icons for fallback
const defaultCategoryIcons = ["📱", "👕", "🏠", "⚽", "📚", "💄", "🎮", "🚗"];

export default function Categories() {
  const { categories: allCategories, loading } = useCategories();
  const categories = allCategories.slice(0, 6); // Show only first 6 categories
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'lv';
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Populārās kategorijas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
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
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="text-4xl mb-4">
                  {defaultCategoryIcons[index % defaultCategoryIcons.length]}
                </div>
                <h4 className="text-xl font-semibold mb-2">{category.name}</h4>
                <p className="text-gray-600">Apskatīt kategoriju</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Nav pievienotu kategoriju
            </div>
          )}
        </div>
      </div>
    </section>
  );
}