'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function NewStatusWrapper() {
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string[]>(['operational'])
  const [category, setCategory] = useState<string[]>(['feature'])
  const [description, setDescription] = useState('')
  const [releaseVersion, setReleaseVersion] = useState('')
  const [priority, setPriority] = useState<string[]>(['3'])
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [affectedComponentsJson, setAffectedComponentsJson] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Helper functions for checkbox handling
  const handleStatusChange = (value: string, checked: boolean) => {
    if (checked) {
      setStatus([...status, value])
    } else {
      setStatus(status.filter(s => s !== value))
    }
  }

  const handleCategoryChange = (value: string, checked: boolean) => {
    if (checked) {
      setCategory([...category, value])
    } else {
      setCategory(category.filter(c => c !== value))
    }
  }

  const handlePriorityChange = (value: string, checked: boolean) => {
    if (checked) {
      setPriority([...priority, value])
    } else {
      setPriority(priority.filter(p => p !== value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Parse affected components JSON if provided
      let affectedComponents = null
      if (affectedComponentsJson.trim()) {
        try {
          affectedComponents = JSON.parse(affectedComponentsJson)
        } catch (err) {
          setError('Invalid JSON format for affected components')
          setIsSubmitting(false)
          return
        }
      }

      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          status: status.length > 0 ? status : ['operational'],
          category: category.length > 0 ? category : ['feature'],
          description: description || null,
          release_version: releaseVersion || null,
          priority: priority.length > 0 ? priority.map(p => parseInt(p)) : [3],
          is_public: isPublic,
          tags: tags.length > 0 ? tags : [],
          affected_components: affectedComponents
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create status update')
      }

      setSuccess(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/status')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-[500px] w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Status Update Created!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting to status page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-[800px] mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <Link href="/status">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Status Update
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New Feature Released"
                required
                className="mt-2"
              />
            </div>

            {/* Status */}
            <div>
              <Label className="text-gray-900 dark:text-white">
                Status <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {[
                  { value: 'operational', label: 'Operational' },
                  { value: 'investigating', label: 'Investigating' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'degraded', label: 'Degraded' },
                  { value: 'issue', label: 'Issue' },
                  { value: 'outage', label: 'Outage' },
                  { value: 'critical', label: 'Critical' }
                ].map((option) => (
                  <div key={option.value} className="inline-flex items-center gap-2 flex-shrink-0">
                    <input
                      type="checkbox"
                      id={`status-${option.value}`}
                      checked={status.includes(option.value)}
                      onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm text-gray-900 dark:text-white cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="text-gray-900 dark:text-white">
                Category <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {[
                  { value: 'feature', label: 'Feature' },
                  { value: 'bugfix', label: 'Bug Fix' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'security', label: 'Security' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'announcement', label: 'Announcement' }
                ].map((option) => (
                  <div key={option.value} className="inline-flex items-center gap-2 flex-shrink-0">
                    <input
                      type="checkbox"
                      id={`category-${option.value}`}
                      checked={category.includes(option.value)}
                      onChange={(e) => handleCategoryChange(option.value, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor={`category-${option.value}`} className="text-sm text-gray-900 dark:text-white cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about this status update..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Release Version */}
            <div>
              <Label htmlFor="releaseVersion" className="text-gray-900 dark:text-white">
                Release Version
              </Label>
              <Input
                id="releaseVersion"
                type="text"
                value={releaseVersion}
                onChange={(e) => setReleaseVersion(e.target.value)}
                placeholder="e.g., 1.0.5"
                className="mt-2"
              />
            </div>

            {/* Priority */}
            <div>
              <Label className="text-gray-900 dark:text-white">
                Priority
              </Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {[
                  { value: '1', label: '1 (Highest)' },
                  { value: '2', label: '2 (High)' },
                  { value: '3', label: '3 (Medium)' },
                  { value: '4', label: '4 (Low)' },
                  { value: '5', label: '5 (Lowest)' }
                ].map((option) => (
                  <div key={option.value} className="inline-flex items-center gap-2 flex-shrink-0">
                    <input
                      type="checkbox"
                      id={`priority-${option.value}`}
                      checked={priority.includes(option.value)}
                      onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm text-gray-900 dark:text-white cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-gray-900 dark:text-white">
                Tags
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add a tag..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    className="flex-shrink-0"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Affected Components (JSON) */}
            <div>
              <Label htmlFor="affectedComponents" className="text-gray-900 dark:text-white">
                Affected Components (JSON)
              </Label>
              <Textarea
                id="affectedComponents"
                value={affectedComponentsJson}
                onChange={(e) => setAffectedComponentsJson(e.target.value)}
                placeholder='e.g., {"api": true, "frontend": false}'
                rows={3}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional: Enter valid JSON to specify affected components
              </p>
            </div>

            {/* Public Visibility */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <Label htmlFor="isPublic" className="text-gray-900 dark:text-white cursor-pointer">
                Make this update public
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !title || status.length === 0 || category.length === 0}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Create Status Update
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/status')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

