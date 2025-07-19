import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    access_token?: string
    expires_at?: number
    error?: string
  }
}