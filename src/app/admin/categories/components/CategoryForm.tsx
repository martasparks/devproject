'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
}

interface CategoryFormProps {
  initialData?: Category;
  isEditing?: boolean;
  availableParents?: Category[];
}

export default function CategoryForm({ initialData, isEditing = false, availableParents = [] }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    parentId: initialData?.parentId || '',
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[āăäà]/g, 'a')
      .replace(/[ēěëè]/g, 'e')
      .replace(/[īìîï]/g, 'i')
      .replace(/[ōòôöõ]/g, 'o')
      .replace(/[ūùûü]/g, 'u')
      .replace(/[čç]/g, 'c')
      .replace(/[ģ]/g, 'g')
      .replace(/[ķ]/g, 'k')
      .replace(/[ļ]/g, 'l')
      .replace(/[ņ]/g, 'n')
      .replace(/[šş]/g, 's')
      .replace(/[žź]/g, 'z')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert('Nosaukums un slug ir obligāti');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing 
        ? `/api/admin/categories/${initialData?.id}`
        : '/api/admin/categories';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kļūda saglabājot kategoriju. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current category and its children from parent options
  const parentOptions = availableParents.filter(cat => {
    if (isEditing && initialData) {
      return cat.id !== initialData.id && cat.parentId !== initialData.id;
    }
    return true;
  });

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nosaukums *
          </label>
          <input
            type="text"
            id="name"
            required
            placeholder="Kategorijas nosaukums"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            required
            placeholder="kategorijas-slug"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            URL draudzīgs identifikators, automātiski ģenerējas no nosaukuma
          </p>
        </div>

        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
            Vecāka kategorija (izvēles)
          </label>
          <select
            id="parentId"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          >
            <option value="">Nav vecāka kategorijas</option>
            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Izvēlieties vecāka kategoriju, lai izveidotu apakškategoriju
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting 
              ? 'Saglabā...' 
              : (isEditing ? 'Atjaunināt' : 'Izveidot')
            }
          </button>
          <Link
            href="/admin/categories"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Atcelt
          </Link>
        </div>
      </form>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Padomi</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Slug tiek automātiski ģenerēts no nosaukuma</li>
          <li>• Izmantojiet īsus un skaidrus nosaukumus</li>
          <li>• Apakškategorijas palīdz organizēt produktus</li>
          <li>• Slug nedrīkst atkārtoties citām kategorijām</li>
        </ul>
      </div>
    </div>
  );
}