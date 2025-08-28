import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminTopBar from "./components/AdminTopBar";
import prisma from "@lib/prisma";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const topBarLinks = await prisma.topBar.findMany({
    where: { isActive: true },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Top Bar */}
      <AdminTopBar links={topBarLinks} />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
          <h2 className="text-xl font-bold mb-6">Admin Panelis</h2>
          <nav className="flex flex-col space-y-2">
            <Link href="/admin" className="hover:bg-gray-800 px-3 py-2 rounded">
              📊 Pārskats
            </Link>
            
            <div className="border-t border-gray-700 my-4"></div>
            <div className="text-xs text-gray-500 px-3 mb-2">SATURS</div>
            
            <Link href="/admin/translations" className="hover:bg-gray-800 px-3 py-2 rounded">
              🌐 Tulkojumi
            </Link>
            <Link href="/admin/sliders" className="hover:bg-gray-800 px-3 py-2 rounded">
              🖼️ Slaideris
            </Link>
            <Link href="/admin/users" className="hover:bg-gray-800 px-3 py-2 rounded">
              👥 Lietotāji
            </Link>
            <Link href="/admin/topbar-links" className="hover:bg-gray-800 px-3 py-2 rounded">
              🔗 TopBar Linki
            </Link>
            <Link href="/admin/categories" className="hover:bg-gray-800 px-3 py-2 rounded">
              📂 Kategorijas
            </Link>
            <Link href="/admin/manufacturers" className="hover:bg-gray-800 px-3 py-2 rounded">
              🏭 Ražotāji
            </Link>
            <Link href="/admin/settings" className="hover:bg-gray-800 px-3 py-2 rounded">
              ⚙️ Iestatījumi
            </Link>
            
            <div className="border-t border-gray-700 my-4"></div>
            <div className="text-xs text-gray-500 px-3 mb-2">NĀKAMIE</div>
            
            <div className="px-3 py-2 text-gray-600 text-sm cursor-not-allowed">
              📦 Produkti (tiks pievienots)
            </div>
            <div className="px-3 py-2 text-gray-600 text-sm cursor-not-allowed">
              🛍️ Pasūtījumi (tiks pievienots)
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
