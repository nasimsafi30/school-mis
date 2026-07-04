import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid email or password')
        }

        // Update last login
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id))

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
