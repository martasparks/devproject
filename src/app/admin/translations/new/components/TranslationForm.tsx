'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function TranslationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      locale: formData.get('locale') as string,
      namespace: formData.get('namespace') as string,
      key: formData.get('key') as string,
      value: formData.get('value') as string,
    };

    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create translation');
      }

      toast.success('Tulkojums veiksmīgi izveidots!', {
        duration: 3000,
        icon: '✅',
      });

      router.push('/admin/translations');
      router.refresh();
    } catch (error) {
      console.error('Error creating translation:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda izveidojot tulkojumu. Lūdzu mēģiniet vēlreiz.',
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
          <Link href="/admin/translations">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pievienot jaunu tulkojumu</h1>
          <p className="text-gray-600 mt-1">Izveidojiet jaunu tulkojumu aplikācijas saskarnes elementiem</p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Tulkojuma informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="locale">Valoda *</Label>
              <select 
                id="locale"
                name="locale" 
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Izvēlieties valodu</option>
                <option value="lv">🇱🇻 Latviešu (lv)</option>
                <option value="en">🇺🇸 English (en)</option>
                <option value="ru">🇷🇺 Русский (ru)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace *</Label>
              <Input
                id="namespace"
                name="namespace" 
                type="text"
                required
                placeholder="piemēram: Header, HomePage, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Atslēga *</Label>
            <Input
              id="key"
              name="key" 
              type="text"
              required
              placeholder="piemēram: searchPlaceholder, logoAlt"
            />
            <p className="text-xs text-gray-600">
              Izmantojiet camelCase formātu atslēgu nosaukumiem
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Tulkojuma teksts *</Label>
            <Textarea
              id="value"
              name="value" 
              required
              rows={4}
              placeholder="Ievadiet tulkojuma tekstu šeit..."
            />
            <p className="text-xs text-gray-600">
              Tulkojuma teksts, kas tiks parādīts aplikācijā
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/translations">
                Atcelt
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <CheckIcon className="w-4 h-4" />
              {isSubmitting ? 'Saglabā...' : 'Saglabāt tulkojumu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}