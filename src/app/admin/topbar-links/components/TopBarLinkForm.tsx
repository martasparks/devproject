'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopBarLink {
  id: number;
  title: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  order: number;
}

interface TopBarLinkFormProps {
  initialData?: TopBarLink;
  isEditing?: boolean;
}


export default function TopBarLinkForm({ initialData, isEditing = false }: TopBarLinkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    icon: initialData?.icon || '',
    isActive: initialData?.isActive ?? true,
    order: initialData?.order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditing 
        ? `/api/admin/topbar-links/${initialData?.id}`
        : '/api/admin/topbar-links';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save link');
      }

      router.push('/admin/topbar-links');
      router.refresh();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Kļūda saglabājot linku. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Nosaukums *
          </label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <input
            type="text"
            id="url"
            required
            placeholder="/kontakti vai https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Iekšējie linki: /kontakti, /par-mums vai ārējie: https://example.com
          </p>
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
            Ikona
          </label>
          <input
            type="text"
            id="icon"
            placeholder="ChartBarIcon"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Heroicons/react/24/outline ikonu nosaukumi, piemēram: ChartBarIcon, CogIcon, DocumentTextIcon
          </p>
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
            Kārtība
          </label>
          <input
            type="number"
            id="order"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Aktīvs
          </label>
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
            href="/admin/topbar-links"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Atcelt
          </Link>
        </div>
      </form>
    </div>
  );
}