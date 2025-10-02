import prisma from "@/lib/prisma"
import StatusWrapper from "./status-wrapper"

export default async function StatusPage() {
  // Fetch all public status updates - no authentication required
  const rawStatusUpdates = await prisma.appstatusupdates.findMany({
    where: {
      is_public: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Transform the data to match the StatusUpdate interface
  const statusUpdates = rawStatusUpdates.map(update => ({
    ...update,
    description: update.description || undefined,
    release_version: update.release_version || undefined,
    priority: update.priority || undefined
  }))

  return <StatusWrapper statusUpdates={statusUpdates} />
}

