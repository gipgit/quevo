"use client"

import { useEffect, useState } from "react"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import type { BusinessFormData } from "../business-onboarding-form"
import { parseContacts, Contact } from "@/lib/utils/contacts"

interface ContactInfoStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ContactInfoStep({ formData, updateFormData, onValidationChange }: ContactInfoStepProps) {
  const [emails, setEmails] = useState<Contact[]>(() => {
    const parsed = parseContacts(formData.business_email)
    // Always ensure at least one email input is available
    return parsed.length > 0 ? parsed : [{ id: `email-${Date.now()}`, title: '', value: '' }]
  })

  const [phones, setPhones] = useState<Contact[]>(() => {
    const parsed = parseContacts(formData.business_phone)
    // Always ensure at least one phone input is available
    return parsed.length > 0 ? parsed : [{ id: `phone-${Date.now()}`, title: '', value: '' }]
  })

  useEffect(() => {
    // This step is always valid since it's optional
    onValidationChange(true)
  }, [onValidationChange])

  const addEmail = () => {
    if (emails.length < 3) {
      const newEmail: Contact = {
        id: `email-${Date.now()}`,
        title: '',
        value: ''
      }
      const updatedEmails = [...emails, newEmail]
      setEmails(updatedEmails)
      updateFormData({ business_email: JSON.stringify(updatedEmails) })
    }
  }

  const removeEmail = (id: string) => {
    // Don't allow removing the last email input
    if (emails.length > 1) {
      const updatedEmails = emails.filter(email => email.id !== id)
      setEmails(updatedEmails)
      updateFormData({ business_email: JSON.stringify(updatedEmails) })
    }
  }

  const updateEmail = (id: string, field: 'title' | 'value', value: string) => {
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, [field]: value } : email
    )
    setEmails(updatedEmails)
    updateFormData({ business_email: JSON.stringify(updatedEmails) })
  }

  const addPhone = () => {
    if (phones.length < 3) {
      const newPhone: Contact = {
        id: `phone-${Date.now()}`,
        title: '',
        value: ''
      }
      const updatedPhones = [...phones, newPhone]
      setPhones(updatedPhones)
      updateFormData({ business_phone: JSON.stringify(updatedPhones) })
    }
  }

  const removePhone = (id: string) => {
    // Don't allow removing the last phone input
    if (phones.length > 1) {
      const updatedPhones = phones.filter(phone => phone.id !== id)
      setPhones(updatedPhones)
      updateFormData({ business_phone: JSON.stringify(updatedPhones) })
    }
  }

  const updatePhone = (id: string, field: 'title' | 'value', value: string) => {
    const updatedPhones = phones.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    )
    setPhones(updatedPhones)
    updateFormData({ business_phone: JSON.stringify(updatedPhones) })
  }

  return (
    <div className="space-y-8">
      {/* Emails Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Email</h3>
          {emails.length < 3 && (
            <button
              onClick={addEmail}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Aggiungi Email
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {emails.map((email, index) => (
            <div key={email.id} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={email.value}
                  onChange={(e) => updateEmail(email.id, 'value', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@ilmiobusiness.com"
                />
              </div>
              
              <div className="w-32">
                <input
                  type="text"
                  value={email.title}
                  onChange={(e) => updateEmail(email.id, 'title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titolo"
                />
              </div>
              
              {emails.length > 1 && (
                <button
                  onClick={() => removeEmail(email.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phones Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Telefoni</h3>
          {phones.length < 3 && (
            <button
              onClick={addPhone}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Aggiungi Telefono
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {phones.map((phone, index) => (
            <div key={phone.id} className="flex items-center gap-2">
              <div className="flex-1">
        <input
          type="tel"
                  value={phone.value}
                  onChange={(e) => updatePhone(phone.id, 'value', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+39 123 456 7890"
        />
      </div>

              <div className="w-32">
        <input
                  type="text"
                  value={phone.title}
                  onChange={(e) => updatePhone(phone.id, 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titolo"
                />
              </div>
              
              {phones.length > 1 && (
                <button
                  onClick={() => removePhone(phone.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}
