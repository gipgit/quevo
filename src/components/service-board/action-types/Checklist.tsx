import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ChecklistDetails } from "@/types/service-board"

interface Props {
  details: ChecklistDetails
  onUpdate: () => void
  action_id?: string
}

export default function Checklist({ details, onUpdate, action_id }: Props) {
  const t = useTranslations("ServiceBoard")
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [isEditingNote, setIsEditingNote] = useState<Record<string, boolean>>({})
  const [localItems, setLocalItems] = useState(details.items || [])

  const areItemsEqual = (a: typeof localItems, b: typeof localItems): boolean => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    const byIdA = new Map(a.map(it => [it.id, it]))
    const byIdB = new Map(b.map(it => [it.id, it]))
    for (const [id, itemA] of byIdA.entries()) {
      const itemB = byIdB.get(id)
      if (!itemB) return false
      if (
        itemA.text !== itemB.text ||
        !!itemA.is_completed !== !!itemB.is_completed ||
        (itemA.notes || '') !== (itemB.notes || '')
      ) {
        return false
      }
    }
    return true
  }

  useEffect(() => {
    const incoming = details.items || []
    if (!areItemsEqual(incoming, localItems)) {
      setLocalItems(incoming)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.items])

  const handleToggleItem = (itemId: string, isCompleted: boolean) => {
    // Purely local toggle; persistence happens only when clicking Save
    setLocalItems(prev => prev.map(it => (
      it.id === itemId
        ? { ...it, is_completed: isCompleted, completed_at: isCompleted ? (it.completed_at || new Date().toISOString()) : undefined }
        : it
    )))
  }

  const calculateProgress = () => {
    const totalItems = Array.isArray(localItems) ? localItems.length : 0
    if (totalItems === 0) return 0
    const completedItems = localItems.filter(item => item && item.is_completed).length
    return Math.round((completedItems / totalItems) * 100)
  }

  const handleSaveNote = (itemId: string) => {
    setIsEditingNote(prev => ({ ...prev, [itemId]: false }))
  }

  const handleSubmitChanges = async () => {
    if (!action_id) {
      // If we don't have action_id, just trigger parent refresh
      onUpdate()
      return
    }
    try {
      const itemsToSubmit = localItems.map(it => ({
        id: it.id,
        text: it.text,
        is_completed: !!it.is_completed,
        required: !!it.required,
        completed_at: it.is_completed ? (it.completed_at || new Date().toISOString()) : undefined,
        notes: itemNotes[it.id] !== undefined ? itemNotes[it.id] : it.notes,
        attachments: it.attachments,
      }))

      const response = await fetch(`/api/service-board/checklist/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id, items: itemsToSubmit }),
      })

      if (!response.ok) {
        throw new Error('Failed to save checklist changes')
      }

      onUpdate()
    } catch (error) {
      console.error('Error saving checklist changes:', error)
    }
  }

  return (
    <div className="space-y-4">
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

      <div className="space-y-1 lg:space-y-2">
        {Array.isArray(localItems) && localItems.map((item, index) => (
          <div key={item.id} className={`bg-white rounded-lg border p-2 lg:p-3 ${item.is_completed ? 'border-green-300 bg-green-50/40' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={!!item.is_completed}
                  onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${
                    item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {item.text || ''}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.is_completed && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {isEditingNote[item.id] ? 'Close' : (item.notes ? 'Edit note' : 'Add note')}
                    </button>
                  </div>
                </div>
                {item.notes && !isEditingNote[item.id] && (
                  <div className="mt-2 text-xs text-gray-600">{item.notes}</div>
                )}
                {isEditingNote[item.id] && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a note"
                      value={itemNotes[item.id] ?? item.notes ?? ''}
                      onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button type="button" onClick={() => handleSaveNote(item.id)} className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-black">
                      Done
                    </button>
                  </div>
                )}
                {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Attachments:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {attachment.name || 'File'}
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

      {/* Progress below items */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{t('progress')}</h4>
          <span className="text-sm font-medium text-gray-900">{calculateProgress()}%</span>
        </div>
        <div className="mt-2 relative">
          <div className="overflow-hidden h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-green-600 rounded transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Submit changes button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmitChanges}
          className="w-full md:w-auto text-blue-600 hover:text-blue-700"
        >
          Save checklist changes
        </button>
      </div>

      {(!Array.isArray(details.items) || details.items.length === 0) && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No items in this checklist.</p>
        </div>
      )}
    </div>
  )
} 