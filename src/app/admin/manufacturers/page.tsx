import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import DeleteManufacturerButton from "./components/DeleteManufacturerButton";
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default async function ManufacturersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const manufacturers = await prisma.productBrand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  if (!manufacturers || manufacturers.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Nav atrasti ražotāji</h2>
          <p className="text-gray-600 max-w-md">
            Sāciet, pievienojot pirmo ražotāju savai aplikācijai. Ražotāji palīdz organizēt produktus pēc zīmoliem.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/manufacturers/new">
            <PlusIcon className="w-4 h-4" />
            Pievienot jaunu ražotāju
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
          <h1 className="text-3xl font-bold text-gray-900">Ražotāji</h1>
          <p className="text-gray-600 mt-1">
            Pārvaldiet produktu ražotājus un viņu informāciju
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/manufacturers/new">
            <PlusIcon className="w-4 h-4" />
            Pievienot jaunu
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Kopā ražotāji</p>
              <p className="text-2xl font-bold text-gray-900">{manufacturers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Aktīvie ražotāji</p>
              <p className="text-2xl font-bold text-gray-900">{manufacturers.filter(m => m.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ar piegādes laiku</p>
              <p className="text-2xl font-bold text-gray-900">{manufacturers.filter(m => m.deliveryTime).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Ražotāju saraksts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nosaukums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Piegādes laiks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {manufacturers.map((manufacturer) => (
                <tr key={manufacturer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {manufacturer.logoUrl && (
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={manufacturer.logoUrl} 
                          alt={manufacturer.name}
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{manufacturer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {manufacturer.brandCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {manufacturer.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {manufacturer.deliveryTime || 'Nav norādīts'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {manufacturer._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      manufacturer.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {manufacturer.isActive ? 'Aktīvs' : 'Neaktīvs'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manufacturers/${manufacturer.id}/edit`}>
                        <PencilIcon className="w-4 h-4" />
                        Labot
                      </Link>
                    </Button>
                    <DeleteManufacturerButton 
                      manufacturerId={manufacturer.id}
                      manufacturerName={manufacturer.name}
                      hasProducts={manufacturer._count.products > 0}
                    />
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