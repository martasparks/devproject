'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon } from '@heroicons/react/24/outline';

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

      toast.success(
        isEditing ? 'Links veiksmīgi atjaunināts!' : 'Links veiksmīgi izveidots!',
        {
          duration: 3000,
          icon: '✅',
        }
      );

      router.push('/admin/topbar-links');
      router.refresh();
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda saglabājot linku. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/topbar-links">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Rediģēt TopBar linku' : 'Pievienot jaunu TopBar linku'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atjauniniet linka informāciju' : 'Izveidojiet jaunu linku navigācijas panelī'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Linka informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Nosaukums *</Label>
            <Input
              id="title"
              type="text"
              required
              placeholder="Linka nosaukums"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="text"
              required
              placeholder="/kontakti vai https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <p className="text-xs text-gray-600">
              Iekšējie linki: /kontakti, /par-mums vai ārējie: https://example.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ikona</Label>
            <Input
              id="icon"
              type="text"
              placeholder="ChartBarIcon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <p className="text-xs text-gray-600">
              Heroicons/react/24/outline ikonu nosaukumi, piemēram: ChartBarIcon, CogIcon, DocumentTextIcon
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Kārtība</Label>
            <Input
              id="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Aktīvs</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/topbar-links">
                Atcelt
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <CheckIcon className="w-4 h-4" />
              {isSubmitting 
                ? 'Saglabā...' 
                : (isEditing ? 'Atjaunināt' : 'Izveidot')
              }
            </Button>
          </div>
        </form>
      </div>
      
      {/* Tips Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <LightBulbIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Noderīgi padomi</h4>
            <ul className="text-yellow-800 text-sm space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Izmantojiet skaidrus un īsus nosaukumus</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Kārtība nosaka linku secību navigācijā</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Neaktīvi linki netiek rādīti apmeklētājiem</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}