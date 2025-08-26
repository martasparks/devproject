import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import prisma from "@lib/prisma";
import CategoryForm from "../../components/CategoryForm";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  
  const [category, availableParents] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true }
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!category) {
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-8">
      <CategoryForm 
        initialData={category}
        isEditing={true}
        availableParents={availableParents}
      />
      
      {category.children.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 font-bold text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">Uzmanību</h4>
              <p className="text-orange-800 text-sm">
                Šai kategorijai ir <strong>{category.children.length}</strong> apakškategorija(s). 
                Mainot vecāka kategoriju, apakškategorijas paliks pie vecās kategorijas.
              </p>
              <div className="mt-3">
                <p className="text-orange-700 text-xs">
                  Apakškategorijas: {category.children.map(child => child.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}