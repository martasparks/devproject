"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Check sessionStorage first
        const cached = sessionStorage.getItem('categories');
        const cacheTime = sessionStorage.getItem('categories-time');
        const now = Date.now();
        
        if (cached && cacheTime && (now - parseInt(cacheTime)) < 300000) { // 5 minutes
          setCategories(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        const categoriesData = data.categories || [];
        
        setCategories(categoriesData);
        
        // Cache in sessionStorage
        sessionStorage.setItem('categories', JSON.stringify(categoriesData));
        sessionStorage.setItem('categories-time', now.toString());
        
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}