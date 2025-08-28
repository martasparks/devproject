import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import DeleteCategoryButton from "./components/DeleteCategoryButton";
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, FolderIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  // Build hierarchical structure
  const mainCategories = categories.filter(cat => !cat.parentId);
  
  const buildHierarchy = (parentId: string | null, level = 0): any[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        level,
        children: buildHierarchy(cat.id, level + 1)
      }));
  };
  
  const hierarchicalData: any[] = [];
  mainCategories.forEach(mainCat => {
    hierarchicalData.push({ ...mainCat, level: 0 });
    const addChildren = (parentId: string, level: number) => {
      const children = categories.filter(cat => cat.parentId === parentId);
      children.forEach(child => {
        hierarchicalData.push({ ...child, level });
        addChildren(child.id, level + 1);
      });
    };
    addChildren(mainCat.id, 1);
  });

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FolderIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Nav atrastas kategorijas</h2>
          <p className="text-gray-600 max-w-md">
            Sāciet, pievienojot pirmo kategoriju savai aplikācijai. Kategorijas palīdz organizēt produktus un saturu.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/categories/new">
            <PlusIcon className="w-4 h-4" />
            Pievienot jaunu kategoriju
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
          <h1 className="text-3xl font-bold text-gray-900">Kategorijas</h1>
          <p className="text-gray-600 mt-1">
            Pārvaldiet produktu kategorijas un apakškategorijas
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
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
              <FolderIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Kopā kategorijas</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Galvenās kategorijas</p>
              <p className="text-2xl font-bold text-gray-900">{mainCategories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowRightIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Apakškategorijas</p>
              <p className="text-2xl font-bold text-gray-900">{categories.filter(cat => cat.parentId).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Hierarchical Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Visas kategorijas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nosaukums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tips
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hierarchicalData.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900" style={{ paddingLeft: `${category.level * 24}px` }}>
                      {category.level > 0 && (
                        <>
                          {Array.from({ length: category.level }).map((_, i) => (
                            <div key={i} className="w-4 h-4 flex items-center justify-center mr-1">
                              <div className="w-px h-4 bg-gray-300"></div>
                            </div>
                          ))}
                          <ArrowRightIcon className="w-4 h-4 text-gray-400 mr-2" />
                        </>
                      )}
                      {category.level === 0 && <FolderIcon className="w-4 h-4 text-blue-600 mr-2" />}
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {category.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.level === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Galvenā kategorija
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {category.level === 1 ? '1. apakškategorija' : `${category.level}. apakškategorija`}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <PencilIcon className="w-4 h-4" />
                        Labot
                      </Link>
                    </Button>
                    <DeleteCategoryButton 
                      categoryId={category.id}
                      categoryName={category.name}
                      hasChildren={category.children && category.children.length > 0}
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