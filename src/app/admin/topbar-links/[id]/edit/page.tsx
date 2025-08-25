import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import prisma from "@lib/prisma";
import TopBarLinkForm from "../../components/TopBarLinkForm";

interface EditTopBarLinkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTopBarLinkPage({ params }: EditTopBarLinkPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const link = await prisma.topBar.findUnique({
    where: { id: parseInt(id) }
  });

  if (!link) {
    redirect("/admin/topbar-links");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labot TopBar linku</h1>
      </div>

      <TopBarLinkForm 
        initialData={link}
        isEditing={true}
      />
    </div>
  );
}