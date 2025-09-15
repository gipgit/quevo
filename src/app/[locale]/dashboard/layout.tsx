import { SessionProvider } from "next-auth/react"
import ServerBusinessProvider from "@/lib/server-business-provider"
import { ThemeProvider } from "@/contexts/ThemeProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ServerBusinessProvider>
               <ThemeProvider>
          {children}
        </ThemeProvider>
      </ServerBusinessProvider>
    </SessionProvider>
  )
}
