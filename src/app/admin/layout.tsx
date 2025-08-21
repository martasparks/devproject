import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Admin Panelis</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/admin/translations" className="hover:bg-gray-800 px-3 py-2 rounded">
            Tulkojumi
          </Link>
          <Link href="/admin/products" className="hover:bg-gray-800 px-3 py-2 rounded">
            Produkti
          </Link>
          <Link href="/admin/users" className="hover:bg-gray-800 px-3 py-2 rounded">
            Lietotāji
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
