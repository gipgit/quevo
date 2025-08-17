import { SessionProvider } from "next-auth/react"
import ServerBusinessProvider from "@/lib/server-business-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ServerBusinessProvider>
        {children}
      </ServerBusinessProvider>
    </SessionProvider>
  )
}
