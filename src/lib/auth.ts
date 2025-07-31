import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import type { NextAuthConfig, DefaultSession } from "next-auth"

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
                credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
            userType: { label: "User Type", type: "text" }, // 'manager' or 'customer'
            autoLoginToken: { label: "Auto Login Token", type: "text" }, // For auto-login from activation
          },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.userType) {
          return null
        }

        // For auto-login, password is optional if autoLoginToken is provided
        if (!credentials?.password && !credentials?.autoLoginToken) {
          return null
        }

        try {
          const email = credentials.email as string
          const password = credentials.password as string
          const userType = credentials.userType as string
          const autoLoginToken = credentials.autoLoginToken as string

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
            if (autoLoginToken) {
              // For auto-login with token, verify the token matches
              if (user.token_activation !== autoLoginToken) {
                throw new Error("Token di auto-login non valido.")
              }
              if (user.active !== "active") {
                throw new Error("Account non attivo.")
              }
              // Clear the auto-login token after use
              await prisma.usermanager.update({
                where: { user_id: user.user_id },
                data: { token_activation: null }
              })
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
          console.error("Environment check:", {
            hasAuthSecret: !!process.env.AUTH_SECRET,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
          })
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
      try {
        if (user) {
          token.role = user.role
          token.redirectTo = user.redirectTo
          token.businesses = user.businesses
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && token.sub) {
          session.user.id = token.sub
          session.user.role = (token.role as "customer" | "manager") || "manager"
          session.user.redirectTo = (token.redirectTo as string) || "/dashboard"
          session.user.businesses = (token.businesses as any[]) || []
        } else {
          console.error("Session callback: Missing token or token.sub", { token })
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Handle post-login redirects
        if (url.startsWith("/")) return `${baseUrl}${url}`
        if (new URL(url).origin === baseUrl) return url
        return baseUrl
      } catch (error) {
        console.error("Redirect callback error:", error)
        return baseUrl
      }
    },
  },
}

// Configuration validation (only in development)
if (process.env.NODE_ENV === 'development') {
  const requiredEnvVars = [
    'AUTH_SECRET',
    'NEXTAUTH_SECRET', 
    'NEXTAUTH_URL',
    'DATABASE_URL'
  ]

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars)
  }
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


