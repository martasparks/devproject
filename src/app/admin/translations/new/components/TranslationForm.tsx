'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TranslationItem {
  id: string;
  key: string;
  value: string;
}

export default function TranslationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [translations, setTranslations] = useState<TranslationItem[]>([
    { id: '1', key: '', value: '' }
  ]);

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

  const addTranslation = () => {
    const newId = (translations.length + 1).toString();
    setTranslations([...translations, { id: newId, key: '', value: '' }]);
  };

  const removeTranslation = (id: string) => {
    if (translations.length > 1) {
      setTranslations(translations.filter(t => t.id !== id));
    }
  };

  const updateTranslation = (id: string, field: 'key' | 'value', value: string) => {
    setTranslations(translations.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const locale = formData.get('locale') as string;
    const namespace = selectedNamespace === 'custom' ? formData.get('customNamespace') as string : selectedNamespace;

    try {
      if (isBulkMode) {
        // Bulk mode - create multiple translations
        const validTranslations = translations.filter(t => t.key.trim() && t.value.trim());
        
        if (validTranslations.length === 0) {
          throw new Error('Lūdzu ievadiet vismaz vienu tulkojumu');
        }

        const promises = validTranslations.map(translation => 
          fetch('/api/admin/translations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              locale,
              namespace,
              key: translation.key.trim(),
              value: translation.value.trim(),
            }),
          })
        );

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
        const failed = results.length - successful;

        if (successful > 0) {
          toast.success(`Veiksmīgi izveidoti ${successful} tulkojumi!${failed > 0 ? ` ${failed} neizdevās.` : ''}`, {
            duration: 4000,
            icon: '✅',
          });
        } else {
          throw new Error('Neizdevās izveidot nevienu tulkojumu');
        }
      } else {
        // Single mode - create one translation
        const data = {
          locale,
          namespace,
          key: formData.get('key') as string,
          value: formData.get('value') as string,
        };

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
      }

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
      
      {/* Mode Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Režīma izvēle</h3>
            <p className="text-sm text-gray-600">
              Izvēlieties, vai pievienot vienu vai vairākus tulkojumus vienlaicīgi
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={!isBulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsBulkMode(false)}
            >
              Viens tulkojums
            </Button>
            <Button
              type="button"
              variant={isBulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsBulkMode(true)}
            >
              Vairāki tulkojumi
            </Button>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            {isBulkMode ? 'Tulkojumu informācija' : 'Tulkojuma informācija'}
          </h2>
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
                required
                placeholder="piemēram: MyCustomComponent"
              />
              <p className="text-xs text-gray-600">
                Ievadiet pielāgotu namespace nosaukumu
              </p>
            </div>
          )}

          {!isBulkMode ? (
            // Single translation mode
            <>
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
            </>
          ) : (
            // Bulk translation mode
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tulkojumi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTranslation}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Pievienot tulkojumu
                </Button>
              </div>
              
              <div className="space-y-4">
                {translations.map((translation, index) => (
                  <div key={translation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Tulkojums {index + 1}
                      </span>
                      {translations.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTranslation(translation.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Atslēga *</Label>
                        <Input
                          type="text"
                          value={translation.key}
                          onChange={(e) => updateTranslation(translation.id, 'key', e.target.value)}
                          placeholder="piemēram: searchPlaceholder"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tulkojuma teksts *</Label>
                        <Input
                          type="text"
                          value={translation.value}
                          onChange={(e) => updateTranslation(translation.id, 'value', e.target.value)}
                          placeholder="Ievadiet tulkojuma tekstu"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/translations">
                Atcelt
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <CheckIcon className="w-4 h-4" />
              {isSubmitting 
                ? 'Saglabā...' 
                : (isBulkMode ? 'Saglabāt tulkojumus' : 'Saglabāt tulkojumu')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}