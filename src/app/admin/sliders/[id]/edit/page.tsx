'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Slider {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  showContent: boolean;
  isActive: boolean;
  order: number;
}

export default function EditSliderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [slider, setSlider] = useState<Slider | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSlider();
  }, [id]);

  const fetchSlider = async () => {
    try {
      const response = await fetch(`/api/admin/sliders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch slider');
      }
      const data = await response.json();
      setSlider(data);
    } catch (error) {
      console.error('Error fetching slider:', error);
      setFetchError('Failed to load slider');
      toast.error('Kļūda ielādējot slaidu', {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  const handleImagePreview = (file: File, type: 'desktop' | 'mobile') => {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'desktop') {
        setDesktopImagePreview(reader.result as string);
      } else {
        setMobileImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/admin/sliders/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update slider');
      }

      toast.success('Slaids veiksmīgi atjaunināts!', {
        duration: 3000,
        icon: '✅',
      });

      router.push('/admin/sliders');
    } catch (error) {
      console.error('Error updating slider:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda atjauninot slaidu. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Kļūda ielādējot slaidu</h2>
          <p className="text-gray-600 max-w-md">{fetchError}</p>
        </div>
        <Button asChild>
          <Link href="/admin/sliders">
            Atpakaļ uz slaidiem
          </Link>
        </Button>
      </div>
    );
  }

  if (!slider) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <h2 className="text-xl font-medium text-gray-900">Ielādē slaidu...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/sliders">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rediģēt slaidu</h1>
          <p className="text-gray-600 mt-1">
            Atjauniniet slaida informāciju un attēlus
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Slaida informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Virsraksts *</Label>
              <Input
                type="text"
                name="title"
                id="title"
                required
                defaultValue={slider.title}
                placeholder="Slaida virsraksts"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Apakšvirsraksts</Label>
              <Input
                type="text"
                name="subtitle"
                id="subtitle"
                defaultValue={slider.subtitle || ''}
                placeholder="Slaida apakšvirsraksts"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Apraksts</Label>
            <Textarea
              name="description"
              id="description"
              rows={4}
              defaultValue={slider.description || ''}
              placeholder="Slaida apraksts"
            />
          </div>

          {/* Desktop Image */}
          <div className="space-y-3">
            <Label>Desktop attēls</Label>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pašreizējais attēls:</p>
                <img 
                  src={slider.desktopImageUrl} 
                  alt={slider.title}
                  className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="desktopImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Jauns desktop attēls (1920x1080px)</span>
                    </p>
                    <p className="text-xs text-gray-500">Atstāj tukšu, ja nevēlies mainīt</p>
                  </div>
                  <input
                    id="desktopImage"
                    type="file"
                    name="desktopImage"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImagePreview(file, 'desktop');
                    }}
                  />
                </label>
              </div>
              {desktopImagePreview && (
                <div className="relative">
                  <img
                    src={desktopImagePreview}
                    alt="Desktop preview"
                    className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600 mt-1">Jaunais desktop attēla priekšskatījums</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Image */}
          <div className="space-y-3">
            <Label>Mobile attēls (izvēles)</Label>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pašreizējais mobile attēls:</p>
                {slider.mobileImageUrl ? (
                  <img 
                    src={slider.mobileImageUrl} 
                    alt={`${slider.title} - mobile`}
                    className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    Nav mobile attēla
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="mobileImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Jauns mobile attēls (1080x1350px)</span>
                    </p>
                    <p className="text-xs text-gray-500">Nav obligāts</p>
                  </div>
                  <input
                    id="mobileImage"
                    type="file"
                    name="mobileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImagePreview(file, 'mobile');
                    }}
                  />
                </label>
              </div>
              {mobileImagePreview && (
                <div className="relative">
                  <img
                    src={mobileImagePreview}
                    alt="Mobile preview"
                    className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600 mt-1">Jaunais mobile attēla priekšskatījums</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Pogas teksts</Label>
              <Input
                type="text"
                name="buttonText"
                id="buttonText"
                defaultValue={slider.buttonText || ''}
                placeholder="Uzzināt vairāk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Pogas saite</Label>
              <Input
                type="url"
                name="buttonUrl"
                id="buttonUrl"
                defaultValue={slider.buttonUrl || ''}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Kārtība</Label>
            <Input
              type="number"
              name="order"
              id="order"
              defaultValue={slider.order}
              min="0"
              className="max-w-32"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="showContent"
                id="showContent"
                defaultChecked={slider.showContent}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="showContent">Rādīt teksta saturu (virsraksts, apraksts, poga)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={slider.isActive}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive">Slaids ir aktīvs</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/sliders">
                Atcelt
              </Link>
            </Button>
            <Button type="submit" disabled={loading}>
              <CheckIcon className="w-4 h-4" />
              {loading ? 'Saglabā...' : 'Saglabāt izmaiņas'}
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
                <span>Ja nepievienojat jaunu attēlu, saglabāsies esošais</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Izmēri paliek tie paši: Desktop 1920x1080px, Mobile 1080x1350px</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Atjauniniet tikai nepieciešamos laukus</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}