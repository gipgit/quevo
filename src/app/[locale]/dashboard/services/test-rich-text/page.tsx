"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import RichTextEditor from "@/components/ui/RichTextEditor"
import RichTextDisplay from "@/components/ui/RichTextDisplay"

export default function TestRichTextPage() {
  const t = useTranslations("services")
  const { theme } = useTheme()
  const [content, setContent] = useState("")

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className={`text-2xl font-bold mb-6 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>Rich Text Editor Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Editor</h2>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Enter some rich text content..."
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>

          <div>
            <h2 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Preview</h2>
            <div className={`p-4 border rounded-lg ${
              theme === 'dark' 
                ? 'border-gray-600 bg-zinc-800' 
                : 'border-gray-300 bg-white'
            }`}>
              {content ? (
                <RichTextDisplay
                  content={content}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              ) : (
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>No content to display</p>
              )}
            </div>
          </div>

          <div>
            <h2 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Raw HTML</h2>
            <pre className={`p-4 border rounded-lg text-xs overflow-auto ${
              theme === 'dark' 
                ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                : 'border-gray-300 bg-gray-50 text-gray-900'
            }`}>
              {content || 'No content'}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 