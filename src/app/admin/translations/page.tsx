import prisma from '@lib/prisma';
import Link from 'next/link';

export default async function TranslationsPage() {
  const translations = await prisma.translation.findMany({
    orderBy: [
      { locale: 'asc' },
      { namespace: 'asc' },
      { key: 'asc' }
    ]
  });
  if (!translations || translations.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Nav atrasti tulkojumi</h1>
        <Link 
          href="/admin/translations/new"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pievienot jaunu tulkojumu
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tulkojumi</h1>
        <Link 
          href="/admin/translations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pievienot jaunu
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valoda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namespace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atslēga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vērtība</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.map((translation) => (
                <tr key={translation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {translation.locale}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{translation.namespace}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{translation.key}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{translation.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link 
                      href={`/admin/translations/${translation.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Labot
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Dzēst
                    </button>
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
