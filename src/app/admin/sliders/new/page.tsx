'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSliderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      router.push('/admin/sliders');
    } catch (error) {
      console.error('Error creating slider:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pievienot jaunu slaidu</h1>
        <Link
          href="/admin/sliders"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Atpakaļ
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Virsraksts *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
              Apakšvirsraksts
            </label>
            <input
              type="text"
              name="subtitle"
              id="subtitle"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Apraksts
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="desktopImage" className="block text-sm font-medium text-gray-700">
              Desktop bilde *
            </label>
            <input
              type="file"
              name="desktopImage"
              id="desktopImage"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">Ieteicamie izmēri: 1920x1080px</p>
          </div>

          <div>
            <label htmlFor="mobileImage" className="block text-sm font-medium text-gray-700">
              Mobile bilde (nav obligāti)
            </label>
            <input
              type="file"
              name="mobileImage"
              id="mobileImage"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">Ieteicamie izmēri: 1080x1920px (9:16 ratio). Ja nav norādīta, tiks izmantota desktop bilde.</p>
          </div>

          <div>
            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700">
              Pogas teksts
            </label>
            <input
              type="text"
              name="buttonText"
              id="buttonText"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="buttonUrl" className="block text-sm font-medium text-gray-700">
              Pogas saite
            </label>
            <input
              type="url"
              name="buttonUrl"
              id="buttonUrl"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Kārtība
            </label>
            <input
              type="number"
              name="order"
              id="order"
              defaultValue="0"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="showContent"
                id="showContent"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showContent" className="ml-2 block text-sm text-gray-900">
                Rādīt teksta saturu (virsraksts, apraksts, poga)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Slaids ir aktīvs
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/sliders"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Atcelt
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saglabā...' : 'Saglabāt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}