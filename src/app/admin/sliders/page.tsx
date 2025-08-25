import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteSliderButton from "./components/DeleteSliderButton";
import prisma from "@lib/prisma";

export default async function SlidersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const sliders = await prisma.slider.findMany({
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Slaideris</h1>
        <Link 
          href="/admin/sliders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pievienot jaunu
        </Link>
      </div>

      {sliders.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-500">Nav atrasti slaidi</h2>
          <Link 
            href="/admin/sliders/new"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pievienot pirmo slaidu
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bilde</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Virsraksts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apakšvirsraksts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saturs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktīvs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kārtība</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sliders.map((slider: any) => (
                  <tr key={slider.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-24">
                        <img 
                          className="h-16 w-24 object-cover rounded-lg" 
                          src={slider.desktopImageUrl} 
                          alt={slider.title}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                      <div className="truncate">{slider.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">{slider.subtitle || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        slider.showContent 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slider.showContent ? 'Rāda' : 'Slēpts'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        slider.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slider.isActive ? 'Aktīvs' : 'Neaktīvs'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slider.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        href={`/admin/sliders/${slider.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Labot
                      </Link>
                      <DeleteSliderButton 
                        sliderId={slider.id}
                        sliderTitle={slider.title}
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
        Kopā: {sliders.length} slaidi
      </div>
    </div>
  );
}