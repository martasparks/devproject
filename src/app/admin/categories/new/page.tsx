import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import prisma from "@lib/prisma";
import CategoryForm from "../components/CategoryForm";

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  function flattenCategories(categories: any[], depth = 0) {
    let result: { id: string; name: string; slug: string; depth: number }[] = [];

    for (const cat of categories) {
      result.push({ id: cat.id, name: cat.name, slug: cat.slug, depth });

      if (cat.children?.length) {
        result = result.concat(flattenCategories(cat.children, depth + 1));
      }
    }

    return result;
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const flatCategories = flattenCategories(categories);

  return <CategoryForm availableParents={flatCategories} />;

}