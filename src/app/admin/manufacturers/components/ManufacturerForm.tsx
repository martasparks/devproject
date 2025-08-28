'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface Manufacturer {
  id: string;
  name: string;
  brandCode: string;
  slug: string;
  deliveryTime?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  nextProductNum: number;
}

interface ManufacturerFormProps {
  initialData?: Manufacturer;
  isEditing?: boolean;
}

export default function ManufacturerForm({ initialData, isEditing = false }: ManufacturerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brandCode: initialData?.brandCode || '',
    slug: initialData?.slug || '',
    deliveryTime: initialData?.deliveryTime || '',
    logoUrl: initialData?.logoUrl || '',
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
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

  // Generate brand code from name (3 first letters)
  const generateBrandCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .padEnd(3, 'X');
  };

  const handleNameChange = (name: string) => {
    const newData = {
      ...formData,
      name,
    };

    // Only auto-generate if not editing or if current values match auto-generated ones
    if (!isEditing || formData.slug === generateSlug(formData.name)) {
      newData.slug = generateSlug(name);
    }
    if (!isEditing || formData.brandCode === generateBrandCode(formData.name)) {
      newData.brandCode = generateBrandCode(name);
    }

    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.brandCode) {
      toast.error('Nosaukums, slug un kods ir obligāti', {
        duration: 4000,
        icon: '❌',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing 
        ? `/api/admin/manufacturers/${initialData?.id}`
        : '/api/admin/manufacturers';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          brandCode: formData.brandCode,
          slug: formData.slug,
          deliveryTime: formData.deliveryTime || null,
          logoUrl: formData.logoUrl || null,
          description: formData.description || null,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save manufacturer');
      }

      toast.success(
        isEditing ? 'Ražotājs veiksmīgi atjaunināts!' : 'Ražotājs veiksmīgi izveidots!',
        {
          duration: 3000,
          icon: '✅',
        }
      );

      router.push('/admin/manufacturers');
      router.refresh();
    } catch (error) {
      console.error('Error saving manufacturer:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda saglabājot ražotāju. Lūdzu mēģiniet vēlreiz.',
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
          <Link href="/admin/manufacturers">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Rediģēt ražotāju' : 'Pievienot jaunu ražotāju'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atjauniniet ražotāja informāciju' : 'Izveidojiet jaunu ražotāju produktu organizēšanai'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Ražotāja informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nosaukums *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Ražotāja nosaukums"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandCode">Ražotāja kods *</Label>
              <Input
                id="brandCode"
                type="text"
                required
                placeholder="GOO"
                value={formData.brandCode}
                onChange={(e) => setFormData({ ...formData, brandCode: e.target.value.toUpperCase() })}
                maxLength={3}
              />
              <p className="text-xs text-gray-600">
                3 burtu kods, automātiski ģenerējas no nosaukuma
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                type="text"
                required
                placeholder="razotaja-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <p className="text-xs text-gray-600">
                URL draudzīgs identifikators
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Piegādes laiks</Label>
              <Input
                id="deliveryTime"
                type="text"
                placeholder="7-14 darba dienas"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              />
              <p className="text-xs text-gray-600">
                Paredzamais piegādes laiks
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
            <p className="text-xs text-gray-600">
              Ražotāja logo attēla saite
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Apraksts</Label>
            <Textarea
              id="description"
              placeholder="Ražotāja apraksts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
            />
            <Label htmlFor="isActive">Aktīvs</Label>
            <p className="text-xs text-gray-600 ml-2">
              Vai ražotājs ir aktīvs un redzams lietotājiem
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/manufacturers">
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
                <span>Ražotāja kods tiks izmantots produktu kodu ģenerēšanai (piemēram: GOO-001)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Slug tiek automātiski ģenerēts no nosaukuma</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Piegādes laiks palīdzēs klientiem plānot pirkumus</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Logo uzlabos ražotāja atpazīstamību</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}