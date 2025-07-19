import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.access_token = account.access_token
                token.refresh_token = account.refresh_token
                token.expires_at = account.expires_at
            }
            return token
        },
        async session({ session, token }) {
            session.access_token = token.access_token as string
            return session
        },
    },
    session: {
        strategy: 'jwt',
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
