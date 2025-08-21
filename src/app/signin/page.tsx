import { redirect } from "next/navigation"
import { signIn, providerMap, auth } from "@lib/auth"
import { AuthError } from "next-auth"
 
const SIGNIN_ERROR_URL = "/error"
 
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (session?.user) {
    return redirect("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow">
        <div className="space-y-4">
          <form
            action={async (formData) => {
              "use server"
              try {
                await signIn("email", formData)
              } catch (error) {
                if (error instanceof AuthError) {
                  return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                }
                throw error
              }
            }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
              <input
                name="email"
                id="email"
                type="email"
                className="mt-1 mb-3 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </label>
            <input
              type="submit"
              value="Send Magic Link"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            />
          </form>
          {providerMap &&
            providerMap.map((provider) => (
              <form
                key={provider.id}
                action={async () => {
                  "use server"
                  try {
                    await signIn(provider.id, {
                      redirectTo: callbackUrl || "",
                    })
                  } catch (error) {
                    if (error instanceof AuthError) {
                      return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                    }
                    throw error
                  }
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <span>Sign in with {provider.name}</span>
                </button>
              </form>
            ))}
        </div>
      </div>
    </div>
  )
}