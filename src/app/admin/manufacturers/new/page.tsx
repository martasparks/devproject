import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import ManufacturerForm from "../components/ManufacturerForm";

export default async function NewManufacturerPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <ManufacturerForm />;
}