import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  confirmationStatus: 'pending' | 'confirmed' | 'rescheduled'
  onConfirm: () => Promise<void>
  onReschedule: (reason: string) => Promise<void>
}

export default function AppointmentActions({ confirmationStatus, onConfirm, onReschedule }: Props) {
  const t = useTranslations('ServiceBoard')
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleReason, setRescheduleReason] = useState('')

  const handleRescheduleRequest = async () => {
    try {
      await onReschedule(rescheduleReason)
      setIsRescheduling(false)
    } catch (error) {
      console.error('Error requesting reschedule:', error)
    }
  }

  if (confirmationStatus !== 'pending') {
    return null
  }

  if (isRescheduling) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">{t('rescheduleReason')}</h4>
        <textarea
          value={rescheduleReason}
          onChange={(e) => setRescheduleReason(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3"
          rows={3}
          placeholder={t('enterRescheduleReason')}
        />
        <div className="flex gap-3">
          <button
            onClick={handleRescheduleRequest}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('submitRequest')}
          </button>
          <button
            onClick={() => setIsRescheduling(false)}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onConfirm}
        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t('confirm')}
      </button>
      <button
        onClick={() => setIsRescheduling(true)}
        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        {t('reschedule')}
      </button>
    </div>
  )
} 