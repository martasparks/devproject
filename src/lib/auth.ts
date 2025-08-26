import NextAuth from "next-auth"
import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"

import { Pool } from "@neondatabase/serverless"
import NeonAdapter from "@auth/neon-adapter"


if (
  !process.env.DATABASE_URL ||
  !process.env.AUTH_FACEBOOK_ID ||
  !process.env.AUTH_FACEBOOK_SECRET ||
  !process.env.AUTH_GOOGLE_ID ||
  !process.env.AUTH_GOOGLE_SECRET ||
  !process.env.EMAIL_SERVER ||
  !process.env.EMAIL_FROM
) {
  throw new Error(
    "Missing one or more required environment variables: DATABASE_URL, AUTH_FACEBOOK_ID, AUTH_FACEBOOK_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, EMAIL_SERVER, EMAIL_FROM"
  )
}

const providers = [
  Facebook({
    clientId: process.env.AUTH_FACEBOOK_ID,
    clientSecret: process.env.AUTH_FACEBOOK_SECRET,
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
  Nodemailer({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
  }),
]

export const providerMap = providers.map((provider) => ({
  id: provider.id,
  name: provider.name,
}))

export const { handlers, auth, signIn } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  return {
    adapter: NeonAdapter(pool),
    providers,
    pages: {
      signIn: "/signin",
    },
  }
})