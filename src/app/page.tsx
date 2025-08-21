import { signIn, signOut, auth } from "@lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is a simple Next.js application with authentication.</p>

      {session?.user ? (
        <div style={{marginTop: "20px", padding: "10px", border: "1px solid green"}}>
          <h2>Logged in as:</h2>
          <img src={session.user.image || ""} alt="profile" width={50} height={50} />
          <p><strong>Name:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Session expires:</strong> {new Date(session.expires || "").toLocaleString()}</p>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button type="submit">Logout</button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            "use server"
            await signIn("facebook")
          }}
        >
          <button type="submit">Signin with Facebook</button>
        </form>
      )}
    </div>
  );
}
