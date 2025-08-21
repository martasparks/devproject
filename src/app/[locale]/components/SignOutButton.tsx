import { signOut } from "@lib/auth";
import { getTranslations } from "next-intl/server";

export default async function SignOutButton() {
  const t = await getTranslations("HomePage");
  
  return (
    <form
      action={async () => {
        "use server"
        await signOut();
      }}
    >
      <button 
        type="submit"
        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
