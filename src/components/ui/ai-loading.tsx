'use client'

import { StarIcon } from "@heroicons/react/24/outline"

interface AILoadingProps {
  title?: string
  subtitle?: string
  showPostCount?: boolean
  postCount?: number
}

export default function AILoading({ 
  title = "AI is Generating Your Content", 
  subtitle = "Creating unique posts and building your timeline...",
  showPostCount = false,
  postCount = 0
}: AILoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative">
        {/* AI Star Icon with Enhanced Gradient Background */}
        <div className="relative">
          {/* Blurred/Shadowy Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-cyan-500/30 rounded-full blur-xl scale-150 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-cyan-400/20 rounded-full blur-lg scale-125 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Main Icon Container */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <StarIcon className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-lg"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-pink-400 rounded-full shadow-lg"></div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {showPostCount && postCount > 0 ? `${subtitle} (${postCount} posts)` : subtitle}
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
