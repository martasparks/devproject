import { signOut } from "@lib/auth";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function SignOutButton() {
  const t = await getTranslations("HomePage");
  
  return (
    <form
      action={async () => {
        "use server"
        await signOut();
      }}
    >
      <Button 
        type="submit"
        variant="outline"
        size="sm"
      >
        {t("signOut")}
      </Button>
    </form>
  );
}
