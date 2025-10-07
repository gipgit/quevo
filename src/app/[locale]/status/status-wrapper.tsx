'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  CheckCircle as CheckCircleIcon, 
  TriangleAlert as ExclamationTriangleIcon, 
  Info as InformationCircleIcon,
  Wrench as WrenchScrewdriverIcon,
  Plus as PlusIcon,
  Clock as ClockIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface StatusUpdate {
  update_id: string
  title: string
  status: string
  category: string
  description?: string
  created_at: Date
  last_updated: Date
  tags?: string[]
  affected_components?: any
  release_version?: string
  is_public: boolean
  priority?: number
}

interface StatusWrapperProps {
  statusUpdates: StatusUpdate[]
}

export default function StatusWrapper({ statusUpdates: initialStatusUpdates }: StatusWrapperProps) {
  const router = useRouter()
  const [statusUpdates] = useState(initialStatusUpdates)

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
      case 'resolved':
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'investigating':
      case 'in_progress':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500" />
      case 'degraded':
      case 'issue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'outage':
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'investigating':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'degraded':
      case 'issue':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'outage':
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feature':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'bugfix':
      case 'bug':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'performance':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header/Hero Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                System Status
              </h1>
            </div>
            <Link href="/status/new">
              <Button variant="outline" className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Update
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {statusUpdates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8">
            <div className="text-center py-12">
              <InformationCircleIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No status updates yet
              </p>
              <Link href="/status/new">
                <Button className="flex items-center gap-2 mx-auto">
                  <PlusIcon className="w-4 h-4" />
                  Add First Update
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            
            {/* Timeline items */}
            <div className="space-y-6">
              {statusUpdates.map((update, index) => (
                <div key={update.update_id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-gray-400"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    {/* Date/Time above title */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>Created: {formatDate(update.created_at)}</span>
                      </div>
                      {update.last_updated && new Date(update.last_updated).getTime() !== new Date(update.created_at).getTime() && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>Updated: {formatDate(update.last_updated)}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges with priority */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusColor(update.status)}>
                        {update.status}
                      </Badge>
                      <Badge className={getCategoryColor(update.category)}>
                        {update.category}
                      </Badge>
                      {update.priority && (
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Priority: {update.priority}
                        </Badge>
                      )}
                      {update.release_version && (
                        <Badge variant="outline">
                          v{update.release_version}
                        </Badge>
                      )}
                      {update.tags && update.tags.length > 0 && (
                        update.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {update.title}
                    </h3>

                    {/* Description */}
                    {update.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                        {update.description}
                      </p>
                    )}

                    {/* Affected Components */}
                    {update.affected_components && (
                      <div className="mb-3 p-3 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                          Affected Components
                        </p>
                        <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                          {JSON.stringify(update.affected_components, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

