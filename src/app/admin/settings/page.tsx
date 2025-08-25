import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const settings = await prisma.settings.findMany({
    orderBy: { key: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Iestatījumi</h1>
        <Link 
          href="/admin/settings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pievienot jaunu
        </Link>
      </div>

      {settings.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-500">Nav atrasti iestatījumi</h2>
          <Link 
            href="/admin/settings/new"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pievienot pirmo iestatījumu
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atslēga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vērtība</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attēls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {setting.key}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {setting.value || <span className="text-gray-400">Tukšs</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {setting.imageUrl ? (
                        <img 
                          src={setting.imageUrl} 
                          alt="Setting image" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">Nav</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        href={`/admin/settings/${setting.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Labot
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Kopā: {settings.length} iestatījumi
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Kā izmantot</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• Iestatījumi tiek izmantoti visā lapā dažādiem mērķiem</p>
          <p>• <strong>site_logo</strong> - mājas lapas logotips</p>
          <p>• <strong>site_name</strong> - mājas lapas nosaukums</p>
          <p>• <strong>contact_email</strong> - kontakta e-pasts</p>
        </div>
      </div>
    </div>
  );
}