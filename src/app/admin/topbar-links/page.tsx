import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import DeleteTopBarLinkButton from "./components/DeleteTopBarLinkButton";

export default async function TopBarLinksPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const links = await prisma.topBar.findMany({
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">TopBar Linki</h1>
        <div className="flex space-x-3">
          <Link 
            href="/admin/topbar-links/icons"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            📋 Pieejamās ikonas
          </Link>
          <Link 
            href="/admin/topbar-links/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pievienot jaunu
          </Link>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-500">Nav atrasti linki</h2>
          <Link 
            href="/admin/topbar-links/new"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pievienot pirmo linku
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nosaukums</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ikona</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktīvs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kārtība</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link: any) => (
                  <tr key={link.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {link.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {link.url}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {link.icon ? (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {link.icon}
                        </span>
                      ) : (
                        <span className="text-gray-400">Nav</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        link.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {link.isActive ? 'Aktīvs' : 'Neaktīvs'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {link.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        href={`/admin/topbar-links/${link.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Labot
                      </Link>
                      <DeleteTopBarLinkButton 
                        linkId={link.id}
                        linkTitle={link.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Kopā: {links.length} linki
      </div>
    </div>
  );
}