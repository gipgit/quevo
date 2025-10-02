import prisma from "@/lib/prisma"
import StatusWrapper from "./status-wrapper"

export default async function StatusPage() {
  // Fetch all public status updates - no authentication required
  const statusUpdates = await prisma.appstatusupdates.findMany({
    where: {
      is_public: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return <StatusWrapper statusUpdates={statusUpdates} />
}

