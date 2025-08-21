import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "CUSTOMER" | "ADMIN";
  }

  interface Session {
    user: User;
  }
}
