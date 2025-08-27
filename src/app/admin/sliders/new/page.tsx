'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon, PhotoIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getUrlPlaceholderExamples } from '@/lib/url-utils';

export default function NewSliderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);

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
      const response = await fetch('/api/admin/sliders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create slider');
      }

      toast.success('Slaids veiksmīgi izveidots!', {
        duration: 3000,
        icon: '✅',
      });

      router.push('/admin/sliders');
    } catch (error) {
      console.error('Error creating slider:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda izveidojot slaidu. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Pievienot jaunu slaidu</h1>
          <p className="text-gray-600 mt-1">
            Izveidojiet jaunu slaidu mājas lapas slaideram
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Slaida informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Desktop Content */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💻 Desktop versijas saturs</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="desktopTitle">Desktop virsraksts</Label>
                  <Input
                    type="text"
                    name="desktopTitle"
                    id="desktopTitle"
                    placeholder="Desktop slaida virsraksts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desktopSubtitle">Desktop apakšvirsraksts</Label>
                  <Input
                    type="text"
                    name="desktopSubtitle"
                    id="desktopSubtitle"
                    placeholder="Desktop slaida apakšvirsraksts"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktopDescription">Desktop apraksts</Label>
                <Textarea
                  name="desktopDescription"
                  id="desktopDescription"
                  rows={3}
                  placeholder="Desktop slaida apraksts"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="desktopButtonText">Desktop pogas teksts</Label>
                  <Input
                    type="text"
                    name="desktopButtonText"
                    id="desktopButtonText"
                    placeholder="Uzzināt vairāk"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desktopButtonUrl">Desktop pogas saite</Label>
                  <Input
                    type="text"
                    name="desktopButtonUrl"
                    id="desktopButtonUrl"
                    placeholder={getUrlPlaceholderExamples('lv').internal}
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Iekšējiem linkiem: <code className="bg-gray-100 px-1 rounded">mebeles/izpardosana</code></p>
                      <p>Ārējiem linkiem: <code className="bg-gray-100 px-1 rounded">https://example.com</code></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="desktopShowContent"
                  id="desktopShowContent"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="desktopShowContent">Rādīt desktop teksta saturu</Label>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">📱 Mobile versijas saturs</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mobileTitle">Mobile virsraksts</Label>
                  <Input
                    type="text"
                    name="mobileTitle"
                    id="mobileTitle"
                    placeholder="Mobile slaida virsraksts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileSubtitle">Mobile apakšvirsraksts</Label>
                  <Input
                    type="text"
                    name="mobileSubtitle"
                    id="mobileSubtitle"
                    placeholder="Mobile slaida apakšvirsraksts"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileDescription">Mobile apraksts</Label>
                <Textarea
                  name="mobileDescription"
                  id="mobileDescription"
                  rows={3}
                  placeholder="Mobile slaida apraksts"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mobileButtonText">Mobile pogas teksts</Label>
                  <Input
                    type="text"
                    name="mobileButtonText"
                    id="mobileButtonText"
                    placeholder="Uzzināt vairāk"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileButtonUrl">Mobile pogas saite</Label>
                  <Input
                    type="text"
                    name="mobileButtonUrl"
                    id="mobileButtonUrl"
                    placeholder={getUrlPlaceholderExamples('lv').internal}
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Iekšējiem linkiem: <code className="bg-gray-100 px-1 rounded">mebeles/izpardosana</code></p>
                      <p>Ārējiem linkiem: <code className="bg-gray-100 px-1 rounded">https://example.com</code></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="mobileShowContent"
                  id="mobileShowContent"
                  defaultChecked
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Label htmlFor="mobileShowContent">Rādīt mobile teksta saturu</Label>
              </div>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="space-y-3">
            <Label>Desktop attēls *</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="desktopImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Desktop attēls (1920x1080px)</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG vai WebP (MAX. 5MB)</p>
                    <p className="text-xs text-green-600 mt-1">✨ Automātiski optimizēts uz WebP formātu</p>
                  </div>
                  <input
                    id="desktopImage"
                    type="file"
                    name="desktopImage"
                    accept="image/*"
                    required
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
                  <p className="text-sm text-gray-600 mt-1">Desktop attēla priekšskatījums</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Image */}
          <div className="space-y-3">
            <Label>Mobile attēls (izvēles)</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="mobileImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Mobile attēls (1080x1350px)</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG vai WebP (MAX. 5MB)</p>
                    <p className="text-xs text-green-600 mt-1">✨ Automātiski optimizēts uz WebP formātu</p>
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
                  <p className="text-sm text-gray-600 mt-1">Mobile attēla priekšskatījums</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600">
              Ja nav norādīts, tiks izmantots desktop attēls mobilajām ierīcēm
            </p>
          </div>


          <div className="space-y-2">
            <Label htmlFor="order">Kārtība</Label>
            <Input
              type="number"
              name="order"
              id="order"
              defaultValue="0"
              min="0"
              className="max-w-32"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked
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
              {loading ? 'Saglabā...' : 'Saglabāt'}
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
                <span>Desktop attēla ieteicamie izmēri: 1920x1080px</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Mobile attēla ieteicamie izmēri: 1080x1350px (4:5 Instagram)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Kārtība nosaka slaidu secību slaideram</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Neaktīvi slaidi netiek rādīti apmeklētājiem</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Visi attēli automātiski tiek optimizēti uz WebP formātu bez kvalitātes zuduma</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Tagad varat iestatīt atšķirīgu saturu desktop un mobile versijām</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Katrai versijai ir sava rādīt/paslēpt teksta satura iespēja</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Pogas saitēs varat rakstīt tikai ceļu (piem. "mebeles/dīvāni") - locale automātiski pieliekas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}