import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import prisma from "@lib/prisma";
import SettingForm from "../../components/SettingForm";

interface EditSettingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSettingPage({ params }: EditSettingPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const setting = await prisma.settings.findUnique({
    where: { id }
  });

  if (!setting) {
    redirect("/admin/settings");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labot iestatījumu</h1>
      </div>

      <SettingForm 
        initialData={setting}
        isEditing={true}
      />
    </div>
  );
}