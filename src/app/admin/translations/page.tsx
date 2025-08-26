import prisma from '@lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default async function TranslationsPage() {
  const translations = await prisma.translation.findMany({
    orderBy: [
      { locale: 'asc' },
      { namespace: 'asc' },
      { key: 'asc' }
    ]
  });

  // Group translations by locale for stats
  const localeStats = translations.reduce((acc, t) => {
    acc[t.locale] = (acc[t.locale] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!translations || translations.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <GlobeAltIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Nav atrasti tulkojumi</h2>
          <p className="text-gray-600 max-w-md">
            Sāciet, pievienojot pirmo tulkojumu savai aplikācijai. Tulkojumi palīdz padarīt saturu pieejamu dažādās valodās.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/translations/new">
            <PlusIcon className="w-4 h-4" />
            Pievienot jaunu tulkojumu
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tulkojumi</h1>
          <p className="text-gray-600 mt-1">
            Pārvaldiet aplikācijas tulkojumus dažādās valodās
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/translations/new">
            <PlusIcon className="w-4 h-4" />
            Pievienot jaunu
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Kopā tulkojumi</p>
              <p className="text-2xl font-bold text-gray-900">{translations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">LV</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Latviešu</p>
              <p className="text-2xl font-bold text-gray-900">{localeStats.lv || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">EN</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">English</p>
              <p className="text-2xl font-bold text-gray-900">{localeStats.en || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">RU</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Русский</p>
              <p className="text-2xl font-bold text-gray-900">{localeStats.ru || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Visi tulkojumi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valoda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Namespace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atslēga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vērtība
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.map((translation) => (
                <tr key={translation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      translation.locale === 'lv' 
                        ? 'bg-green-100 text-green-800' 
                        : translation.locale === 'en'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {translation.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{translation.namespace}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {translation.key}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={translation.value}>
                      {translation.value}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/translations/${translation.id}/edit`}>
                        <PencilIcon className="w-4 h-4" />
                        Labot
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm">
                      <TrashIcon className="w-4 h-4" />
                      Dzēst
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
