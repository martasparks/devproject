import { auth } from "@lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@lib/prisma";
import ManufacturerForm from "../../components/ManufacturerForm";

interface EditManufacturerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditManufacturerPage({ params }: EditManufacturerPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const manufacturer = await prisma.productBrand.findUnique({
    where: { id }
  });

  if (!manufacturer) {
    notFound();
  }

  return (
    <ManufacturerForm 
      initialData={manufacturer}
      isEditing={true}
    />
  );
}