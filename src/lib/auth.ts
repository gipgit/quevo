import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import type { NextAuthConfig, DefaultSession } from "next-auth"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }, // 'manager' or 'customer'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          return null
        }

        try {
          const email = credentials.email as string
          const password = credentials.password as string
          const userType = credentials.userType as string

          if (userType === "manager") {
            const user = await prisma.usermanager.findUnique({
              where: { email },
              include: {
                business: {
                  select: {
                    business_id: true,
                    business_name: true,
                    business_urlname: true,
                  },
                },
              },
            })

            if (!user) {
              throw new Error("Credenziali non valide")
            }

            // Handle auto-login case (from activation)
            if (password === "auto-login") {
              // For auto-login, we trust the email since it came from our secure activation process
              if (user.active !== "active") {
                throw new Error("Account non attivo.")
              }
            } else {
              // Normal login - check password
              if (!user.password) {
                throw new Error("Credenziali non valide")
              }

              const isValidPassword = await bcrypt.compare(password, user.password)
              if (!isValidPassword) {
                throw new Error("Credenziali non valide")
              }

              if (user.active !== "active") {
                throw new Error("Account non attivo. Controlla la tua email per il link di attivazione.")
              }
            }

            if (user.verification_status !== "verified" && user.verification_status !== "waiting") {
              throw new Error("Account in attesa di verifica da parte dell'amministratore.")
            }

            // Determine redirect path based on business count
            let redirectTo = "/dashboard"
            if (user.business.length === 0) {
              redirectTo = "/dashboard/onboarding"
            } else if (user.business.length === 1) {
              redirectTo = `/dashboard/business/${user.business[0].business_id}`
            } else {
              redirectTo = "/dashboard/select-business"
            }

            return {
              id: user.user_id,
              email: user.email,
              name: `${user.name_first} ${user.name_last}`.trim(),
              role: "manager",
              redirectTo,
              businesses: user.business,
            }
          } else if (userType === "customer") {
            const user = await prisma.usercustomer.findUnique({
              where: { email },
            })

            if (!user || !user.password) {
              throw new Error("Credenziali non valide")
            }

            const isValidPassword = await bcrypt.compare(password, user.password)
            if (!isValidPassword) {
              throw new Error("Credenziali non valide")
            }

            if (user.active !== "active") {
              throw new Error("Account non attivo. Controlla la tua email per il link di attivazione.")
            }

            return {
              id: user.user_id,
              email: user.email,
              name: `${user.name_first} ${user.name_last}`.trim(),
              role: "customer",
              redirectTo: "/profile",
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.redirectTo = user.redirectTo
        token.businesses = user.businesses
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as "customer" | "manager"
        session.user.redirectTo = token.redirectTo as string
        session.user.businesses = token.businesses as any[]
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle post-login redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "customer" | "manager"
      redirectTo?: string
      businesses?: any[]
    } & DefaultSession["user"]
  }

  interface User {
    role: "customer" | "manager"
    redirectTo?: string
    businesses?: any[]
  }
}


