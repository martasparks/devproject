'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'settings');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.url && result.key) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.url,
          imageKey: result.key,
        }));
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Kļūda augšupielādējot attēlu');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      imageUrl: '',
      imageKey: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key) {
      alert('Atslēga ir obligāta');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save setting');
      }

      router.push('/admin/settings');
      router.refresh();
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Kļūda saglabājot iestatījumu. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="keyType" className="block text-sm font-medium text-gray-700 mb-2">
            Iestatījuma tips *
          </label>
          <select
            id="keyType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              Atslēga *
            </label>
            <input
              type="text"
              id="key"
              required
              placeholder="custom_setting_key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={isEditing}
            />
            <p className="mt-1 text-sm text-gray-500">
              Izmantojiet snake_case formātu, piemēram: my_custom_setting
            </p>
          </div>
        )}

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
            Vērtība
          </label>
          <textarea
            id="value"
            rows={3}
            placeholder="Iestatījuma vērtība"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attēls (izvēles)
          </label>
          
          {formData.imageUrl ? (
            <div className="space-y-3">
              <img
                src={formData.imageUrl}
                alt="Setting image"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Noņemt attēlu
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploading && <p className="mt-2 text-sm text-blue-600">Augšupielādē...</p>}
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting 
              ? 'Saglabā...' 
              : (isEditing ? 'Atjaunināt' : 'Izveidot')
            }
          </button>
          <Link
            href="/admin/settings"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Atcelt
          </Link>
        </div>
      </form>
    </div>
  );
}