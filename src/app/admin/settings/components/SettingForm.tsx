'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, ArrowLeftIcon, LightBulbIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Setting {
  id: string;
  key: string;
  value: string;
  imageUrl?: string | null;
  imageKey?: string | null;
}

interface SettingFormProps {
  initialData?: Setting;
  isEditing?: boolean;
}

const commonSettingKeys = [
  { value: 'site_logo', label: 'Lapas logotips (site_logo)' },
  { value: 'site_name', label: 'Lapas nosaukums (site_name)' },
  { value: 'site_description', label: 'Lapas apraksts (site_description)' },
  { value: 'categoryPrefix', label: 'Kategoriju URL prefix (categoryPrefix)' },
  { value: 'contact_email', label: 'Kontakta e-pasts (contact_email)' },
  { value: 'contact_phone', label: 'Kontakta telefons (contact_phone)' },
  { value: 'address', label: 'Adrese (address)' },
  { value: 'working_hours', label: 'Darba laiks (working_hours)' },
  { value: 'facebook_url', label: 'Facebook URL (facebook_url)' },
  { value: 'instagram_url', label: 'Instagram URL (instagram_url)' },
  { value: 'custom', label: 'Cits (ievadīt pašam)' },
];

export default function SettingForm({ initialData, isEditing = false }: SettingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKeyType, setSelectedKeyType] = useState(
    initialData?.key ? 
      (commonSettingKeys.find(k => k.value === initialData.key)?.value || 'custom') : 
      'site_logo'
  );
  
  const [formData, setFormData] = useState({
    key: initialData?.key || 'site_logo',
    value: initialData?.value || '',
    imageUrl: initialData?.imageUrl || '',
    imageKey: initialData?.imageKey || '',
  });

  // Local image state for new uploads
  const [localImage, setLocalImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  // Sync key when selectedKeyType changes  
  useEffect(() => {
    if (selectedKeyType !== 'custom') {
      setFormData(prev => ({ ...prev, key: selectedKeyType }));
    }
  }, [selectedKeyType]);

  const handleKeyTypeChange = (keyType: string) => {
    setSelectedKeyType(keyType);
    if (keyType !== 'custom') {
      setFormData({ ...formData, key: keyType });
    } else {
      setFormData({ ...formData, key: '' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Faila izmērs nedrīkst pārsniegt 5MB', {
        duration: 4000,
        icon: '❌',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lūdzu izvēlieties attēla failu', {
        duration: 4000,
        icon: '❌',
      });
      return;
    }

    // Create preview URL using FileReader for better compatibility
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      setLocalImage({ file, previewUrl });
      
      toast.success('Attēls sagatavots augšupielādei!', {
        duration: 3000,
        icon: '✅',
      });
    };
    reader.onerror = () => {
      toast.error('Kļūda attēla priekšskatīšanā', {
        duration: 4000,
        icon: '❌',
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (localImage) {
      setLocalImage(null);
    }
    if (formData.imageUrl) {
      setFormData({
        ...formData,
        imageUrl: '',
        imageKey: '',
      });
    }
    toast.success('Attēls noņemts', {
      duration: 2000,
      icon: '🗑️',
    });
  };

  const uploadImageToS3 = async (file: File): Promise<{ url: string; key: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'settings');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success || !result.url || !result.key) {
      throw new Error(result.error || 'Upload failed');
    }

    return { url: result.url, key: result.key };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key) {
      toast.error('Atslēga ir obligāta', {
        duration: 4000,
        icon: '❌',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;
      let finalImageKey = formData.imageKey;

      // Upload new image to S3 if there's a local image
      if (localImage) {
        toast.loading('Augšupielādē attēlu...', { id: 'upload' });
        
        try {
          const uploadResult = await uploadImageToS3(localImage.file);
          finalImageUrl = uploadResult.url;
          finalImageKey = uploadResult.key;
          
          toast.success('Attēls veiksmīgi augšupielādēts!', { 
            id: 'upload',
            duration: 3000,
            icon: '✅',
          });
        } catch (error) {
          toast.error('Kļūda augšupielādējot attēlu', { 
            id: 'upload',
            duration: 5000,
            icon: '❌',
          });
          throw error;
        }
      }

      // Submit form data
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl,
          imageKey: finalImageKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save setting');
      }

      toast.success(
        isEditing ? 'Iestatījums veiksmīgi atjaunināts!' : 'Iestatījums veiksmīgi izveidots!',
        {
          duration: 3000,
          icon: '✅',
        }
      );

      router.push('/admin/settings');
      router.refresh();
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda saglabājot iestatījumu. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // FileReader doesn't need cleanup like URL.createObjectURL
    };
  }, []);

  // Get the image to display (local preview or existing image)
  const displayImage = localImage?.previewUrl || formData.imageUrl;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/settings">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Rediģēt iestatījumu' : 'Pievienot jaunu iestatījumu'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Atjauniniet iestatījuma informāciju' : 'Izveidojiet jaunu iestatījumu aplikācijas konfigurēšanai'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Iestatījuma informācija</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyType">Iestatījuma tips *</Label>
            <select
              id="keyType"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedKeyType}
              onChange={(e) => handleKeyTypeChange(e.target.value)}
              disabled={isEditing}
            >
              {commonSettingKeys.map((keyType) => (
                <option key={keyType.value} value={keyType.value}>
                  {keyType.label}
                </option>
              ))}
            </select>
          </div>

          {selectedKeyType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="key">Atslēga *</Label>
              <Input
                type="text"
                id="key"
                required
                placeholder="custom_setting_key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={isEditing}
              />
              <p className="text-xs text-gray-600">
                Izmantojiet snake_case formātu, piemēram: my_custom_setting
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="value">Vērtība</Label>
            <Textarea
              id="value"
              rows={3}
              placeholder="Iestatījuma vērtība"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Attēls</Label>
            
            {displayImage ? (
              <div className="space-y-3">
                <div className="relative inline-block group">
                  <img
                    src={displayImage}
                    alt="Setting image"
                    className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                  />
                  {/* Remove button overlay */}
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {localImage ? 'Attēls tiks augšupielādēts pēc formas nosūtīšanas' : 'Esošais attēls'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Noklikšķiniet, lai augšupielādētu</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG vai WebP (MAX. 5MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
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
                <span>Iestatījumi tiek izmantoti visā aplikācijā</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Logotipa iestatījumam pievienojiet attēlu</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Attēls tiks augšupielādēts tikai pēc veiksmīgas formas nosūtīšanas</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Izmantojiet skaidrus atslēgu nosaukumus</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}