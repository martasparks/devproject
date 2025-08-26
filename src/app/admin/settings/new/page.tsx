import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import SettingForm from "../components/SettingForm";

export default async function NewSettingPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <SettingForm />;
}