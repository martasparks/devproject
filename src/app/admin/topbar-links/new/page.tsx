import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import TopBarLinkForm from "../components/TopBarLinkForm";

export default async function NewTopBarLinkPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pievienot jaunu TopBar linku</h1>
      </div>

      <TopBarLinkForm />
    </div>
  );
}