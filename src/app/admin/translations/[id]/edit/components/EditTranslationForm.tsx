'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Translation {
  id: number;
  locale: string;
  namespace: string;
  key: string;
  value: string;
}

interface EditTranslationFormProps {
  translation: Translation;
}

export default function EditTranslationForm({ translation }: EditTranslationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState(translation.namespace);

  // Common namespaces used in the application
  const commonNamespaces = [
    { value: 'Header', label: 'Header - Galvenā galvene' },
    { value: 'TopBar', label: 'TopBar - Augšējā josla' },
    { value: 'Footer', label: 'Footer - Kājene' },
    { value: 'Menu', label: 'Menu - Navigācijas izvēlne' },
    { value: 'Categories', label: 'Categories - Kategorijas' },
    { value: 'FeaturedProducts', label: 'FeaturedProducts - Ieteiktie produkti' },
    { value: 'Features', label: 'Features - Funkcijas (piegāde, maksājumi, atgriešana)' },
    { value: 'HeroSlider', label: 'HeroSlider - Galvenais slaidrādis' },
    { value: 'BottomMenu', label: 'BottomMenu - Apakšējā izvēlne' },
    { value: 'MobileOffcanvas', label: 'MobileOffcanvas - Mobilā izvēlne' },
    { value: 'ProductCard', label: 'ProductCard - Produkta karte' },
    { value: 'ProductDetail', label: 'ProductDetail - Produkta detaļas' },
    { value: 'CategoryContent', label: 'CategoryContent - Kategorijas saturs' },
    { value: 'Cart', label: 'Cart - Grozs' },
    { value: 'Wishlist', label: 'Wishlist - Vēlmes saraksts' },
    { value: 'SignIn', label: 'SignIn - Ielogošanās' },
    { value: 'TestPage', label: 'TestPage - Testa lapa' },
    { value: 'HomePage', label: 'HomePage - Sākumlapa' },
    { value: 'Admin', label: 'Admin - Administrācijas panelis' },
    { value: 'Settings', label: 'Settings - Iestatījumi' },
    { value: 'custom', label: 'Cits (ievadīt pašam)' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      locale: formData.get('locale') as string,
      namespace: selectedNamespace === 'custom' ? formData.get('customNamespace') as string : selectedNamespace,
      key: formData.get('key') as string,
      value: formData.get('value') as string,
    };

    try {
      const response = await fetch(`/api/admin/translations/${translation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update translation');
      }

      toast.success('Tulkojums veiksmīgi atjaunināts!', {
        duration: 3000,
        icon: '✅',
      });

      router.push('/admin/translations');
      router.refresh();
    } catch (error) {
      console.error('Error updating translation:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda atjauninot tulkojumu. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Vai tiešām vēlaties dzēst šo tulkojumu? Šī darbība nav atgriezeniska.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/translations/${translation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete translation');
      }

      toast.success('Tulkojums veiksmīgi dzēsts!', {
        duration: 3000,
        icon: '🗑️',
      });

      router.push('/admin/translations');
      router.refresh();
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda dzēšot tulkojumu. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/translations">
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Labot tulkojumu</h1>
            <p className="text-gray-600 mt-1">
              Rediģējiet tulkojumu: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{translation.key}</span>
            </p>
          </div>
        </div>
        
        {/* Delete Button */}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <TrashIcon className="w-4 h-4" />
          {isDeleting ? 'Dzēš...' : 'Dzēst'}
        </Button>
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
                defaultValue={translation.locale}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="lv">🇱🇻 Latviešu (lv)</option>
                <option value="en">🇺🇸 English (en)</option>
                <option value="ru">🇷🇺 Русский (ru)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace *</Label>
              <select
                id="namespace"
                name="namespace"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Izvēlieties namespace</option>
                {commonNamespaces.map((ns) => (
                  <option key={ns.value} value={ns.value}>
                    {ns.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedNamespace === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customNamespace">Pielāgots namespace *</Label>
              <Input
                id="customNamespace"
                name="customNamespace" 
                type="text"
                defaultValue={translation.namespace}
                required
                placeholder="piemēram: MyCustomComponent"
              />
              <p className="text-xs text-gray-600">
                Ievadiet pielāgotu namespace nosaukumu
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="key">Atslēga *</Label>
            <Input
              id="key"
              name="key" 
              type="text"
              defaultValue={translation.key}
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
              defaultValue={translation.value}
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
              {isSubmitting ? 'Saglabā...' : 'Saglabāt izmaiņas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}