"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInEmail() {
  const [email, setEmail] = useState("")

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await signIn("email", { email, redirect: false })
        }}
      >
        <input
          type="email"
          placeholder="Ievadi savu e-pastu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Saņemt login linku</button>
      </form>
      <div>
        <button onClick={() => signIn("facebook")}>Login with Facebook</button>
        <button onClick={() => signIn("google")}>Login with Google</button>
      </div>
    </div>
  )
}