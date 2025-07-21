import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChecklistDetails } from "@/types/service-board"

interface Props {
  details: ChecklistDetails
  onUpdate: () => void
}

export default function Checklist({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/service-board/checklist/toggle-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          isCompleted,
          notes: itemNotes[itemId] || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update checklist item')
      }

      onUpdate()
    } catch (error) {
      console.error('Error updating checklist item:', error)
    }
  }

  const calculateProgress = () => {
    const totalItems = details.items.length
    const completedItems = details.items.filter(item => item.is_completed).length
    return Math.round((completedItems / totalItems) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {details.title}
        </h3>
        {details.description && (
          <p className="mt-1 text-sm text-gray-600">
            {details.description}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{t('progress')}</h4>
          <span className="text-sm font-medium text-gray-900">{calculateProgress()}%</span>
        </div>
        <div className="mt-2 relative">
          <div className="overflow-hidden h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-600 rounded transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {details.items.map((item, index) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={item.required && !item.is_completed}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {item.text}
                  </p>
                  {item.completed_at && (
                    <span className="text-xs text-gray-500">
                      {t('completed')} {new Date(item.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {!item.is_completed && (
                  <div className="mt-3">
                    <textarea
                      rows={2}
                      placeholder="Add notes (optional)"
                      value={itemNotes[item.id] || ''}
                      onChange={(e) => setItemNotes(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                      className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                {item.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium">Notes:</p>
                    <p className="mt-1">{item.notes}</p>
                  </div>
                )}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Attachments:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {details.items.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No items in this checklist.</p>
        </div>
      )}
    </div>
  )
} 