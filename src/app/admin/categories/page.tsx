import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@lib/prisma";
import DeleteCategoryButton from "./components/DeleteCategoryButton";

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
    orderBy: { name: 'asc' }
  });

  // Separate main categories and subcategories
  const mainCategories = categories.filter(cat => !cat.parentId);
  const subcategories = categories.filter(cat => cat.parentId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kategorijas</h1>
        <Link 
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Pievienot jaunu
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-500">Nav atrasta neviena kategorija</h2>
          <Link 
            href="/admin/categories/new"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pievienot pirmo kategoriju
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Categories */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Galvenās kategorijas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nosaukums</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apakškategorijas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mainCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.children.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Link 
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Labot
                        </Link>
                        <DeleteCategoryButton 
                          categoryId={category.id}
                          categoryName={category.name}
                          hasChildren={category.children.length > 0}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Apakškategorijas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nosaukums</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vecāka kategorija</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darbības</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subcategories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">└</span>
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {category.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {category.parent?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link 
                            href={`/admin/categories/${category.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Labot
                          </Link>
                          <DeleteCategoryButton 
                            categoryId={category.id}
                            categoryName={category.name}
                            hasChildren={false}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600">
        Kopā: {mainCategories.length} galvenās kategorijas, {subcategories.length} apakškategorijas
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Kā izmantot</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• Kategorijas tiek izmantotas produktu organizēšanai</p>
          <p>• Slug tiek izmantots URL veidošanai</p>
          <p>• Varat izveidot apakškategorijas, izvēloties vecāka kategoriju</p>
          <p>• Kategoriju ar apakškategorijām nevar izdzēst</p>
        </div>
      </div>
    </div>
  );
}