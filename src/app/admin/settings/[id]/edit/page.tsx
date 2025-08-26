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
    <SettingForm 
      initialData={setting}
      isEditing={true}
    />
  );
}