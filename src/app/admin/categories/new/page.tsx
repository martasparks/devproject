import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import prisma from "@lib/prisma";
import CategoryForm from "../components/CategoryForm";

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Get all main categories for parent selection
  const availableParents = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' }
  });

  return <CategoryForm availableParents={availableParents} />;
}