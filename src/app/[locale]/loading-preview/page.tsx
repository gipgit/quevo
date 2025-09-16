'use client'

import React from 'react'
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'

export default function LoadingPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Main Preview - Big and Centered */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-12">
          <div className="w-full h-[400px]">
            <LoadingAIGeneration size="lg" text="Generating AI response..." className="" />
          </div>
        </div>
      </div>
    </div>
  )
}
