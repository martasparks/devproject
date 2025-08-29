'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import CategoryPlaceholder from '@/components/CategoryPlaceholder';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  depth?: number;
}

interface CategoryFormProps {
  initialData?: Category;
  isEditing?: boolean;
  availableParents?: Category[];
}

export default function CategoryForm({ initialData, isEditing = false, availableParents = [] }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    imageKey: initialData?.imageKey || '',
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lūdzu izvēlieties attēla failu.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Attēls ir pārāk liels. Maksimālais izmērs ir 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadData.url,
        imageKey: uploadData.key || ''
      }));
      
      toast.success('Attēls augšupielādēts veiksmīgi!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Kļūda augšupielādējot attēlu.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Nosaukums un slug ir obligāti', {
        duration: 4000,
        icon: '❌',
      });
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
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          imageKey: formData.imageKey || null,
          parentId: formData.parentId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      toast.success(
        isEditing ? 'Kategorija veiksmīgi atjaunināta!' : 'Kategorija veiksmīgi izveidota!',
        {
          duration: 3000,
          icon: '✅',
        }
      );

      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda saglabājot kategoriju. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Rediģēt kategoriju' : 'Pievienot jaunu kategoriju'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atjauniniet kategorijas informāciju' : 'Izveidojiet jaunu kategoriju produktu organizēšanai'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Kategorijas informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nosaukums *</Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="Kategorijas nosaukums"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              type="text"
              required
              placeholder="kategorijas-slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <p className="text-xs text-gray-600">
              URL draudzīgs identifikators, automātiski ģenerējas no nosaukuma
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Apraksts</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Īss apraksts kategorijai..."
            />
          </div>

          {/* Category Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Kategorijas attēls</Label>
              <p className="text-xs text-gray-500">
                Ieteicamais izmērs: 800x450px
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Priekšskatījums</Label>
                <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {formData.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={formData.imageUrl}
                        alt="Kategorijas attēls"
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageKey: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <CategoryPlaceholder 
                      name={formData.name || 'Kategorija'}
                      size="sm"
                      showIcon={false}
                    />
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="lg:col-span-2 space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Augšupielādēt failu</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      ref={(ref) => {
                        if (ref) {
                          (window as any).categoryImageFileInput = ref;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => (window as any).categoryImageFileInput?.click()}
                      disabled={uploading}
                    >
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      {uploading ? 'Augšupielādē...' : 'Izvēlēties failu'}
                    </Button>
                    {uploading && (
                      <div className="text-xs text-gray-500">
                        Augšupielādē attēlu...
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-xs text-gray-600">Vai ievadiet URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm"
                  />
                </div>

                {/* S3 Key */}
                <div className="space-y-2">
                  <Label htmlFor="imageKey" className="text-xs text-gray-600">S3 atslēga (automātiski)</Label>
                  <Input
                    id="imageKey"
                    value={formData.imageKey || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageKey: e.target.value }))}
                    placeholder="categories/image-key"
                    className="text-sm"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Galvenā kategorija</Label>
            <select
              id="parentId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            >
              <option value="">Nav vecāka kategorijas</option>
              {parentOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {"— ".repeat(category.depth ?? 0) + category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600">
              Izvēlieties vecāka kategoriju, lai izveidotu apakškategoriju
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
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
                <span>Slug tiek automātiski ģenerēts no nosaukuma</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Izmantojiet īsus un skaidrus nosaukumus</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Varat izveidot apakškategorijas jebkurai kategorijai</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Hierarhija: Virtuve → Moduļu sistēmas → Sunrise Premier</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Slug nedrīkst atkārtoties citām kategorijām</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}