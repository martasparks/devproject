import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import TopBarLinkForm from "../components/TopBarLinkForm";

export default async function NewTopBarLinkPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <TopBarLinkForm />;
}