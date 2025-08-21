import { getTranslations } from "next-intl/server";
import { auth } from "@lib/auth";
import SignOutButton from "./components/SignOutButton";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const t = await getTranslations("HomePage");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("welcome")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("description")}
          </p>
        </div>

        {session?.user ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              {session.user.image && (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t("welcomeBack", { name: session.user.name ?? session.user.email ?? "Lietotājs" })}
              </h2>
              <p className="text-gray-600">
                {session.user.email}
              </p>
            </div>
            
            <div className="space-y-4">
              {session.user.role === 'ADMIN' && (
                <Link 
                  href="/admin"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("adminPanel")}
                </Link>
              )}
              
              <div>
                <SignOutButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-6">
              {t("notLoggedIn")}
            </p>
            <Link 
              href="/signin"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t("signIn")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
