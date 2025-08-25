import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import SettingForm from "../components/SettingForm";

export default async function NewSettingPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pievienot jaunu iestatījumu</h1>
      </div>

      <SettingForm />
    </div>
  );
}