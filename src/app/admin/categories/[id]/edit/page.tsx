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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labot kategoriju</h1>
      </div>

      <CategoryForm 
        initialData={category}
        isEditing={true}
        availableParents={availableParents}
      />
      
      {category.children.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">⚠️ Uzmanību</h4>
          <p className="text-orange-800 text-sm">
            Šai kategorijai ir {category.children.length} apakškategorija(s). 
            Mainot vecāka kategoriju, apakškategorijas paliks pie vecās kategorijas.
          </p>
        </div>
      )}
    </div>
  );
}