'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/contexts/ThemeContext'
import { useBusiness } from '@/lib/business-context'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface QuotationData {
  requestId: string
  requestReference: string
  business: {
    id: string
    name: string
    description: string | null
    address: string | null
    phone: any
    email: any
    companyName: string | null
    vat: string | null
    companyAddress: string | null
  }
  customer: {
    id: string | undefined
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    region: string | null
    country: string | null
  }
  service: {
    id: number | undefined
    name: string | null
    description: string | null
    basePrice: any
    items: Array<{
      id: number
      name: string
      description: string | null
      price: number | null
      priceAtRequest: number | null
      priceType: string
      priceUnit: string | null
      quantity: number
    }>
    requirements: any[]
  }
  requestDetails: {
    status: string
    dateCreated: Date | null
    notes: string | null
    specialRequirements: string | null
    priceSubtotal: number | null
  }
}

interface SavedTemplate {
  id: number
  template_name: string
  template_data: any
  is_default: boolean
}

interface EditableItem {
  id: number
  name: string
  description: string | null
  price: number
  quantity: number
  isEditable: boolean
}

interface QuotationBuilderProps {
  quotationData: QuotationData
  savedTemplates: SavedTemplate[]
}

export default function QuotationBuilder({ quotationData, savedTemplates }: QuotationBuilderProps) {
  const t = useTranslations('quotation')
  const { theme } = useTheme()
  const { currentBusiness } = useBusiness()
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null)
  const [quotationNumber, setQuotationNumber] = useState(`QT-${quotationData.requestReference}`)
  const [validUntil, setValidUntil] = useState('')
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')
  const [taxPercentage, setTaxPercentage] = useState(22) // Default 22% VAT
  const [isGenerating, setIsGenerating] = useState(false)
  const [introductoryText, setIntroductoryText] = useState('we are pleased to provide you with a detailed quotation for the requested services. Please find below the complete breakdown of costs and terms.')
  const quotationRef = useRef<HTMLDivElement>(null)

  // Create editable items list with main service and service items
  const [editableItems, setEditableItems] = useState<EditableItem[]>(() => {
    const items: EditableItem[] = []
    
    // Add main service
    if (quotationData.service.name) {
      items.push({
        id: 0,
        name: quotationData.service.name,
        description: quotationData.service.description,
        price: quotationData.service.basePrice ? parseFloat(quotationData.service.basePrice) : 0,
        quantity: 1,
        isEditable: true
      })
    }
    
    // Add service items
    quotationData.service.items.forEach(item => {
      items.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price || 0,
        quantity: item.quantity || 1,
        isEditable: true
      })
    })
    
    return items
  })

  const updateItemPrice = (id: number, price: number) => {
    setEditableItems(prev => prev.map(item =>
      item.id === id ? { ...item, price } : item
    ))
  }

  const updateItemQuantity = (id: number, quantity: number) => {
    setEditableItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const calculateSubtotal = () => {
    return editableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxPercentage) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper function to clean JSON array display
  const cleanContactDisplay = (contact: any) => {
    if (Array.isArray(contact)) {
      return contact.join(', ')
    }
    if (typeof contact === 'string') {
      // Remove quotes and brackets if they exist
      return contact.replace(/^\["|"\]$/g, '').replace(/^\[|\]$/g, '').replace(/"/g, '')
    }
    return contact
  }

  // Utility function to get profile image URL following the same pattern as business layout
  const getProfileImageUrl = (business: any) => {
    const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
    
    // Use local path if business_img_profile is empty/undefined, otherwise use R2 predefined path
    return !business?.business_img_profile 
      ? `/uploads/business/${business?.business_public_uuid}/profile.webp`
      : `${R2_PUBLIC_DOMAIN}/business/${business?.business_public_uuid}/profile.webp`;
  };

  const generatePDF = async () => {
    if (!quotationRef.current) return

    setIsGenerating(true)
    try {
             // Create a dedicated PDF container with proper styling
       const pdfContainer = document.createElement('div')
       pdfContainer.style.position = 'absolute'
       pdfContainer.style.left = '-9999px'
       pdfContainer.style.top = '0'
       pdfContainer.style.width = '794px' // A4 width at 96 DPI
       pdfContainer.style.backgroundColor = 'white'
       pdfContainer.style.padding = '40px'
       pdfContainer.style.fontFamily = 'Arial, Helvetica, sans-serif'
       pdfContainer.style.fontSize = '14px'
       pdfContainer.style.lineHeight = '1.5'
       pdfContainer.style.color = 'black'
       pdfContainer.style.border = 'none'
       pdfContainer.style.borderRadius = '0'
       pdfContainer.style.boxShadow = 'none'
       pdfContainer.style.display = 'block'
       pdfContainer.style.boxSizing = 'border-box'
       pdfContainer.style.overflow = 'visible'

      // Clone the content and apply PDF-specific styling
      const clonedContent = quotationRef.current.cloneNode(true) as HTMLElement
      
      // Remove all Tailwind classes and apply clean styling
      clonedContent.className = ''
      clonedContent.style.cssText = `
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
        background: white;
        color: black;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 14px;
        line-height: 1.5;
      `

             // Clean up all child elements
       const cleanElement = (element: HTMLElement) => {
         // Store original classes before removing them
         const originalClasses = element.className
         
         // Remove all classes except quotation-preview
         if (!element.classList.contains('quotation-preview')) {
           element.className = ''
         }
         
         // Apply basic styling based on tag
         const tag = element.tagName.toLowerCase()
         if (tag === 'h1') {
           element.style.cssText = 'font-size: 24px; font-weight: bold; margin: 0 0 16px 0; color: black;'
         } else if (tag === 'h2') {
           element.style.cssText = 'font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: black;'
         } else if (tag === 'h3') {
           element.style.cssText = 'font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: black;'
                   } else if (tag === 'p') {
            let lineHeight = '1.5'
            if (originalClasses.includes('leading-tight')) {
              lineHeight = '1.25'
            }
            
            // Handle font sizes
            let fontSize = '14px'
            if (originalClasses.includes('text-xl')) fontSize = '20px'
            if (originalClasses.includes('text-lg')) fontSize = '18px'
            if (originalClasses.includes('text-base')) fontSize = '16px'
            if (originalClasses.includes('text-xs')) fontSize = '10px'
            
            // Handle description styling (smaller, lighter, closer to title)
            let margin = '0 0 8px 0'
            let color = 'black'
            if (originalClasses.includes('text-gray-400') || originalClasses.includes('text-gray-500')) {
              color = '#6b7280' // lighter gray
              margin = '2px 0 0 0' // much closer to the title
            }
            
            element.style.cssText = `margin: ${margin}; color: ${color}; line-height: ${lineHeight}; font-size: ${fontSize};`
         } else if (tag === 'table') {
           element.style.cssText = 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;'
         } else if (tag === 'th') {
           // Check for specific alignment classes
           let textAlign = 'left'
           if (originalClasses.includes('text-center')) textAlign = 'center'
           if (originalClasses.includes('text-right')) textAlign = 'right'
           element.style.cssText = `border-bottom: 2px solid #333; padding: 8px 4px; text-align: ${textAlign}; font-weight: bold; color: black; font-size: 12px;`
                   } else if (tag === 'td') {
            // Check for specific alignment classes
            let textAlign = 'left'
            if (originalClasses.includes('text-center')) textAlign = 'center'
            if (originalClasses.includes('text-right')) textAlign = 'right'
            
            // Handle font size for prices
            let fontSize = '12px'
            if (originalClasses.includes('text-base')) fontSize = '16px'
            
            element.style.cssText = `border-bottom: 1px solid #ccc; padding: 8px 4px; color: black; font-size: ${fontSize}; vertical-align: top; text-align: ${textAlign};`
         } else if (tag === 'input') {
           // Convert input to plain text for PDF
           const inputValue = (element as HTMLInputElement).value
           const textNode = document.createTextNode(inputValue)
           element.parentNode?.replaceChild(textNode, element)
           return // Skip further processing since we replaced the element
                   } else if (tag === 'img') {
            element.style.cssText = 'border-radius: 50%; border: 2px solid #ccc; width: 80px; height: 80px; object-fit: cover;'
         } else if (tag === 'div' && element.classList.contains('quotation-preview')) {
           element.style.cssText = 'padding: 40px; background: white; color: black; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; margin: 0; border: none; border-radius: 0; box-shadow: none; width: 100%; box-sizing: border-box; overflow: visible;'
         } else if (tag === 'span') {
           element.style.cssText = 'color: black;'
         } else if (tag === 'br') {
           // Keep line breaks
         } else if (tag === 'textarea') {
           element.style.cssText = 'border: 1px solid #ccc; padding: 4px; background: white; color: black; font-size: 12px; width: 100%; resize: none;'
         }
         
         // Handle specific layout classes from original classes
         if (originalClasses.includes('flex')) {
           element.style.cssText = (element.style.cssText || '') + '; display: flex;'
         }
         if (originalClasses.includes('flex-1')) {
           element.style.cssText = (element.style.cssText || '') + '; flex: 1;'
         }
         if (originalClasses.includes('text-right')) {
           element.style.cssText = (element.style.cssText || '') + '; text-align: right;'
         }
         if (originalClasses.includes('justify-between')) {
           element.style.cssText = (element.style.cssText || '') + '; justify-content: space-between;'
         }
         if (originalClasses.includes('justify-end')) {
           element.style.cssText = (element.style.cssText || '') + '; justify-content: flex-end;'
         }
         if (originalClasses.includes('items-start')) {
           element.style.cssText = (element.style.cssText || '') + '; align-items: flex-start;'
         }
         
         // Handle specific column widths
         if (originalClasses.includes('w-1/2')) {
           element.style.cssText = (element.style.cssText || '') + '; width: 50%;'
         }
         if (originalClasses.includes('w-1/6')) {
           element.style.cssText = (element.style.cssText || '') + '; width: 16.666667%;'
         }
         if (originalClasses.includes('w-64')) {
           element.style.cssText = (element.style.cssText || '') + '; width: 256px;'
         }
         if (originalClasses.includes('w-16')) {
           element.style.cssText = (element.style.cssText || '') + '; width: 64px;'
         }
         if (originalClasses.includes('w-20')) {
           element.style.cssText = (element.style.cssText || '') + '; width: 80px;'
         }
         
                   // Handle specific margins
          if (originalClasses.includes('ml-8')) {
            element.style.cssText = (element.style.cssText || '') + '; margin-left: 32px;'
          }
          if (originalClasses.includes('mb-8')) {
            element.style.cssText = (element.style.cssText || '') + '; margin-bottom: 32px;'
          }
          if (originalClasses.includes('mb-4')) {
            element.style.cssText = (element.style.cssText || '') + '; margin-bottom: 16px;'
          }
          if (originalClasses.includes('mt-12')) {
            element.style.cssText = (element.style.cssText || '') + '; margin-top: 48px;'
          }
         
         // Recursively clean children
         Array.from(element.children).forEach(child => {
           cleanElement(child as HTMLElement)
         })
       }

      cleanElement(clonedContent)
      pdfContainer.appendChild(clonedContent)
      document.body.appendChild(pdfContainer)

             // Generate canvas with better settings
       const canvas = await html2canvas(pdfContainer, {
         scale: 2, // Higher scale for better quality
         useCORS: true,
         allowTaint: true,
         backgroundColor: '#ffffff',
         width: 794,
         height: pdfContainer.scrollHeight,
         logging: false,
         removeContainer: false,
         foreignObjectRendering: false,
         imageTimeout: 0
       })

      // Clean up
      document.body.removeChild(pdfContainer)

      // Create PDF with proper dimensions
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Calculate proper dimensions for A4
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const imgWidth = pdfWidth - 20 // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Add image centered on page
      const xOffset = 10 // 10mm margin
      const yOffset = 10 // 10mm margin
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
      
      // If content is longer than one page, add new pages
      let heightLeft = imgHeight
      let currentY = yOffset
      
      while (heightLeft > pdfHeight - 20) { // Leave 10mm margin on each side
        heightLeft -= (pdfHeight - 20)
        currentY -= (pdfHeight - 20)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', xOffset, currentY, imgWidth, imgHeight)
      }

      pdf.save(`quotation-${quotationNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveQuotation = async () => {
    // TODO: Implement save functionality
    console.log('Saving quotation...')
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {t('title') || 'Quotation Generator'}
              </h1>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t('subtitle') || 'Create and customize your quotation'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveQuotation}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                theme === 'dark' 
                  ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              {t('save') || 'Save'}
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                theme === 'dark' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              {isGenerating ? (t('generating') || 'Generating...') : (t('generatePDF') || 'Generate PDF')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
            } shadow-sm border ${
              theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Cog6ToothIcon className="w-5 h-5" />
                <h2 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t('settings') || 'Settings'}
                </h2>
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('template') || 'Template'}
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = savedTemplates.find(t => t.id === parseInt(e.target.value))
                    setSelectedTemplate(template || null)
                  }}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('selectTemplate') || 'Select a template'}</option>
                  {savedTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quotation Number */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('quotationNumber') || 'Quotation Number'}
                </label>
                <input
                  type="text"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Valid Until */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('validUntil') || 'Valid Until'}
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Tax Percentage */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('taxPercentage') || 'Tax Percentage (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Introductory Text */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Introductory Text
                </label>
                <textarea
                  value={introductoryText}
                  onChange={(e) => setIntroductoryText(e.target.value)}
                  rows={3}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter introductory text..."
                />
              </div>

              {/* Terms */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('terms') || 'Terms & Conditions'}
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={4}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('enterTerms') || 'Enter terms and conditions...'}
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('notes') || 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('enterNotes') || 'Enter additional notes...'}
                />
              </div>
            </div>
          </div>

          {/* Quotation Preview */}
          <div className="lg:col-span-2">
            <div 
              ref={quotationRef}
              className={`quotation-preview p-10 ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
              }`}
              style={{ margin: '20px' }}
            >
                             {/* Header */}
               <div className="flex justify-between items-start mb-8">
                 <div className="flex-1">
                   <div className="flex items-start gap-4 mb-4">
                                           <div>
                        {/* Business Profile Image as Logo */}
                        {currentBusiness && (
                          <div className="mb-3">
                            <img
                              src={getProfileImageUrl(currentBusiness)}
                              alt={quotationData.business.name}
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          </div>
                        )}
                        <h1 className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {quotationData.business.name}
                        </h1>
                        {(quotationData.business.address || quotationData.business.companyAddress) && (
                          <p className={`text-sm leading-tight ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {[quotationData.business.address, quotationData.business.companyAddress]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                        {/* Business Contacts */}
                        {quotationData.business.email && (
                          <p className={`text-sm leading-tight ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Email: {cleanContactDisplay(quotationData.business.email)}
                          </p>
                        )}
                        {quotationData.business.phone && (
                          <p className={`text-sm leading-tight ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Phone: {cleanContactDisplay(quotationData.business.phone)}
                          </p>
                        )}
                     </div>
                   </div>
                 </div>
                 
                 {/* Customer Data on the right */}
                 <div className="text-right ml-8">
                   <h3 className={`text-lg font-semibold mb-2 ${
                     theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                   }`}>
                     {t('customer') || 'Customer'}
                   </h3>
                                       <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {quotationData.customer.name}
                    </p>
                                       {quotationData.customer.email && (
                      <p className={`text-sm leading-tight ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {quotationData.customer.email}
                      </p>
                    )}
                    {quotationData.customer.phone && (
                      <p className={`text-sm leading-tight ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {quotationData.customer.phone}
                      </p>
                    )}
                    {(quotationData.customer.address || quotationData.customer.city) && (
                      <p className={`text-sm leading-tight ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {[quotationData.customer.address, quotationData.customer.city, quotationData.customer.region, quotationData.customer.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                 </div>
               </div>

                               {/* Quotation Data - Now below the header */}
                <div className="mb-8">
                  <h2 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {t('quotation') || 'QUOTATION'}
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {t('number') || 'Number'}: {quotationNumber}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {t('date') || 'Date'}: {formatDate(new Date())}
                  </p>
                  {validUntil && (
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {t('validUntil') || 'Valid Until'}: {new Date(validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Introductory Section */}
                <div className="mb-8">
                <p className={`text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className="font-medium">Dear {quotationData.customer.name},</span>
                  <br />
                  {introductoryText}
                </p>
              </div>

              {/* Items Table */}
              {editableItems.length > 0 && (
                <div className="mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={`border-b-2 ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <th className={`text-left py-3 px-2 w-1/2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {t('item') || 'Item'}
                        </th>
                        <th className={`text-center py-3 px-2 w-1/6 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {t('quantity') || 'Qty'}
                        </th>
                        <th className={`text-right py-3 px-2 w-1/6 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {t('price') || 'Price'}
                        </th>
                        <th className={`text-right py-3 px-2 w-1/6 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {t('total') || 'Total'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableItems.map((item, index) => (
                        <tr key={item.id} className={`border-b ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                                                     <td className="py-3 px-2">
                             <div>
                               <p className={`text-base font-semibold ${
                                 theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                               }`}>
                                 {item.name}
                               </p>
                               {item.description && (
                                 <p className={`text-xs mt-1 ${
                                   theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                 }`}>
                                   {item.description}
                                 </p>
                               )}
                             </div>
                           </td>
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className={`w-16 text-center p-1 rounded border ${
                                theme === 'dark' 
                                  ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </td>
                          <td className="py-3 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              className={`w-20 text-right p-1 rounded border ${
                                theme === 'dark' 
                                  ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </td>
                                                     <td className={`py-3 px-2 text-right font-medium text-base ${
                             theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                           }`}>
                             €{(item.price * item.quantity).toFixed(2)}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pricing Summary */}
              <div className="mb-8">
                <div className="flex justify-end">
                  <div className="w-64">
                                                               <div className={`flex justify-between py-2 text-base ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span>{t('subtotal') || 'Subtotal'}:</span>
                        <span className="text-lg font-medium">€{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between py-2 text-base ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span>{t('tax') || 'Tax'} ({taxPercentage}%):</span>
                        <span className="text-lg font-medium">€{calculateTax().toFixed(2)}</span>
                      </div>
                    <div className={`flex justify-between py-3 border-t-2 font-bold text-xl ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-100' 
                        : 'border-gray-300 text-gray-900'
                    }`}>
                      <span>{t('total') || 'Total'}:</span>
                      <span>€{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              {(terms || notes) && (
                <div className="mb-8">
                  {terms && (
                    <div className="mb-4">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {t('terms') || 'Terms & Conditions'}
                      </h3>
                      <p className={`text-sm whitespace-pre-wrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {terms}
                      </p>
                    </div>
                  )}
                  {notes && (
                    <div className="mb-4">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {t('notes') || 'Notes'}
                      </h3>
                      <p className={`text-sm whitespace-pre-wrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Signature Area */}
              <div className="flex justify-end mt-12">
                <div className="text-center">
                  <div className={`w-48 h-20 border-b-2 border-dashed ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-400'
                  } mb-2`}></div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
