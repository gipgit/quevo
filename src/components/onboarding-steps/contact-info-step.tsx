"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus as PlusIcon, Trash2 as TrashIcon, X as XMarkIcon } from 'lucide-react'
import type { BusinessFormData } from "../business-onboarding-form"
import { parseContacts, Contact, isValidEmail, isValidPhone } from "@/lib/utils/contacts"

interface ContactInfoStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ContactInfoStep({ formData, updateFormData, onValidationChange }: ContactInfoStepProps) {
  const t = useTranslations("BusinessOnboarding")
  
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

  const [visibleEmailTitles, setVisibleEmailTitles] = useState<Set<string>>(new Set())
  const [visiblePhoneTitles, setVisiblePhoneTitles] = useState<Set<string>>(new Set())

  const [errors, setErrors] = useState<{ emails: string[], phones: string[] }>({
    emails: [],
    phones: []
  })

  // Validate contacts and update form data
  const validateAndUpdateContacts = () => {
    const emailErrors: string[] = []
    const phoneErrors: string[] = []
    
    // Validate emails
    emails.forEach((email, index) => {
      if (email.value.trim()) {
        if (!isValidEmail(email.value.trim())) {
          emailErrors[index] = t("invalidEmailFormat")
        }
      }
    })

    // Validate phones
    phones.forEach((phone, index) => {
      if (phone.value.trim()) {
        if (!isValidPhone(phone.value.trim())) {
          phoneErrors[index] = t("invalidPhoneFormat")
        }
      }
    })

    setErrors({ emails: emailErrors, phones: phoneErrors })
    
    // Filter out empty contacts and update form data
    const validEmails = emails.filter(email => email.value.trim() !== '')
    const validPhones = phones.filter(phone => phone.value.trim() !== '')
    
    updateFormData({ 
      business_email: validEmails.length > 0 ? JSON.stringify(validEmails) : "[]",
      business_phone: validPhones.length > 0 ? JSON.stringify(validPhones) : "[]"
    })

    // Step is valid if there are no validation errors
    const isValid = emailErrors.every(err => !err) && phoneErrors.every(err => !err)
    onValidationChange(isValid)
  }

  useEffect(() => {
    validateAndUpdateContacts()
  }, [emails, phones])

  const addEmail = () => {
    if (emails.length < 3) {
      const newEmail: Contact = {
        id: `email-${Date.now()}`,
        title: '',
        value: ''
      }
      setEmails([...emails, newEmail])
    }
  }

  const removeEmail = (id: string) => {
    // Don't allow removing the last email input
    if (emails.length > 1) {
      setEmails(emails.filter(email => email.id !== id))
    }
  }

  const updateEmail = (id: string, field: 'title' | 'value', value: string) => {
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, [field]: value } : email
    )
    setEmails(updatedEmails)
  }

  const toggleEmailTitle = (id: string) => {
    const updatedVisibleTitles = new Set(visibleEmailTitles)
    if (updatedVisibleTitles.has(id)) {
      updatedVisibleTitles.delete(id)
    } else {
      updatedVisibleTitles.add(id)
    }
    setVisibleEmailTitles(updatedVisibleTitles)
  }

  const removeEmailTitle = (id: string) => {
    const updatedVisibleTitles = new Set(visibleEmailTitles)
    updatedVisibleTitles.delete(id)
    setVisibleEmailTitles(updatedVisibleTitles)
    
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, title: '' } : email
    )
    setEmails(updatedEmails)
  }

  const addPhone = () => {
    if (phones.length < 3) {
      const newPhone: Contact = {
        id: `phone-${Date.now()}`,
        title: '',
        value: ''
      }
      setPhones([...phones, newPhone])
    }
  }

  const removePhone = (id: string) => {
    // Don't allow removing the last phone input
    if (phones.length > 1) {
      setPhones(phones.filter(phone => phone.id !== id))
    }
  }

  const updatePhone = (id: string, field: 'title' | 'value', value: string) => {
    const updatedPhones = phones.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    )
    setPhones(updatedPhones)
  }

  const togglePhoneTitle = (id: string) => {
    const updatedVisibleTitles = new Set(visiblePhoneTitles)
    if (updatedVisibleTitles.has(id)) {
      updatedVisibleTitles.delete(id)
    } else {
      updatedVisibleTitles.add(id)
    }
    setVisiblePhoneTitles(updatedVisibleTitles)
  }

  const removePhoneTitle = (id: string) => {
    const updatedVisibleTitles = new Set(visiblePhoneTitles)
    updatedVisibleTitles.delete(id)
    setVisiblePhoneTitles(updatedVisibleTitles)
    
    const updatedPhones = phones.map(phone => 
      phone.id === id ? { ...phone, title: '' } : phone
    )
    setPhones(updatedPhones)
  }

  return (
    <div className="space-y-8">
      {/* Emails Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{t("email")}</h3>
          {emails.length < 3 && (
            <button
              onClick={addEmail}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {t("addEmail")}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {emails.map((email, index) => (
            <div key={email.id} className="space-y-2">
              <div className="flex items-center gap-1 md:gap-2">
                {visibleEmailTitles.has(email.id) && (
                  <div className="w-24 relative">
                    <input
                      type="text"
                      value={email.title}
                      onChange={(e) => updateEmail(email.id, 'title', e.target.value)}
                      className="w-full p-2 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      placeholder={t("title")}
                    />
                    <button
                      onClick={() => removeEmailTitle(email.id)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email.value}
                    onChange={(e) => updateEmail(email.id, 'value', e.target.value)}
                    className={`w-full p-2 md:p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${
                      errors.emails[index] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("emailPlaceholder")}
                  />
                  {!visibleEmailTitles.has(email.id) && (
                    <button
                      onClick={() => toggleEmailTitle(email.id)}
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      + {t("title")}
                    </button>
                  )}
                </div>
                
                {emails.length > 1 && (
                  <button
                    onClick={() => removeEmail(email.id)}
                    className="text-red-600 hover:text-red-700 p-1 md:p-2"
                  >
                    <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
              {errors.emails[index] && (
                <p className="text-red-500 text-sm">{errors.emails[index]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phones Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{t("phones")}</h3>
          {phones.length < 3 && (
            <button
              onClick={addPhone}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {t("addPhone")}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {phones.map((phone, index) => (
            <div key={phone.id} className="space-y-2">
              <div className="flex items-center gap-1 md:gap-2">
                {visiblePhoneTitles.has(phone.id) && (
                  <div className="w-24 relative">
                    <input
                      type="text"
                      value={phone.title}
                      onChange={(e) => updatePhone(phone.id, 'title', e.target.value)}
                      className="w-full p-2 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      placeholder={t("title")}
                    />
                    <button
                      onClick={() => removePhoneTitle(phone.id)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex-1 relative">
                  <input
                    type="tel"
                    value={phone.value}
                    onChange={(e) => updatePhone(phone.id, 'value', e.target.value)}
                    className={`w-full p-2 md:p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${
                      errors.phones[index] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("phonePlaceholder")}
                  />
                  {!visiblePhoneTitles.has(phone.id) && (
                    <button
                      onClick={() => togglePhoneTitle(phone.id)}
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      + {t("title")}
                    </button>
                  )}
                </div>
                
                {phones.length > 1 && (
                  <button
                    onClick={() => removePhone(phone.id)}
                    className="text-red-600 hover:text-red-700 p-1 md:p-2"
                  >
                    <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
              {errors.phones[index] && (
                <p className="text-red-500 text-sm">{errors.phones[index]}</p>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}
