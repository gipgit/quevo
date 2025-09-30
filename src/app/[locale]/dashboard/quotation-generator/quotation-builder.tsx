'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/contexts/ThemeProvider'
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
  XMarkIcon,
  PencilIcon
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
    id: string
    name: string | null
    description: string | null
    basePrice: any
    items: Array<{
      id: number
      name: string
      description: string | null
      price: number | null
      priceAtRequest: number | null
      priceType: string | null
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
  priceType: string
  priceUnit: string | null
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingField, setEditingField] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [showItemsModal, setShowItemsModal] = useState(false)
  const [profileImageShape, setProfileImageShape] = useState<'circle' | 'square'>('circle')
  const [profileImageSize, setProfileImageSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [businessVisibility, setBusinessVisibility] = useState<{ address: boolean; companyAddress: boolean; email: boolean; phone: boolean }>({
    address: true,
    companyAddress: true,
    email: true,
    phone: true
  })
  const quotationRef = useRef<HTMLDivElement>(null)

  // Create editable items list with main service and service items
  const [editableItems, setEditableItems] = useState<EditableItem[]>(() => {
    const items: EditableItem[] = []
    
         // Add main service if it has a name
     if (quotationData.service.name) {
       items.push({
         id: 0,
         name: quotationData.service.name,
         description: quotationData.service.description,
         price: quotationData.service.basePrice ? parseFloat(quotationData.service.basePrice) : 0,
         quantity: 1,
         priceType: 'fixed',
         priceUnit: null,
         isEditable: true
       })
     }
    
         // Add service items from the service request
     quotationData.service.items.forEach(item => {
       items.push({
         id: item.id,
         name: item.name,
         description: item.description,
         price: item.priceAtRequest ? parseFloat(item.priceAtRequest.toString()) : (item.price || 0),
         quantity: item.quantity || 1,
         priceType: item.priceType || 'fixed',
         priceUnit: item.priceUnit || null,
         isEditable: true
       })
     })
    
    return items
  })

  const removeItem = (id: number) => {
    setEditableItems(prev => prev.filter(item => item.id !== id))
  }

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
            // Apply dynamic profile image styling based on settings
            const size = profileImageSize === 'sm' ? '48px' : profileImageSize === 'lg' ? '96px' : '80px'
            const borderRadius = profileImageShape === 'circle' ? '50%' : '8px'
            element.style.cssText = `border-radius: ${borderRadius}; width: ${size}; height: ${size}; object-fit: cover;`
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

      // Generate filename: business_name - customer_name - "Quotation" request_reference
      const businessName = quotationData.business.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ')
      const customerName = quotationData.customer.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ')
      const filename = `${businessName} - ${customerName} - Quotation ${quotationData.requestReference}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const openEditModal = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingField('')
    setEditValue('')
  }

  const saveEdit = () => {
    switch (editingField) {
      case 'quotationNumber':
        setQuotationNumber(editValue)
        break
      case 'validUntil':
        setValidUntil(editValue)
        break
      case 'taxPercentage':
        setTaxPercentage(parseFloat(editValue) || 0)
        break
      case 'introductoryText':
        setIntroductoryText(editValue)
        break
      case 'terms':
        setTerms(editValue)
        break
      case 'notes':
        setNotes(editValue)
        break
      case 'profileImageStyle': {
        const [shape, size] = editValue.split('|') as ['circle' | 'square', 'sm' | 'md' | 'lg']
        if (shape === 'circle' || shape === 'square') setProfileImageShape(shape)
        if (size === 'sm' || size === 'md' || size === 'lg') setProfileImageSize(size)
        break
      }
      case 'businessVisibility': {
        try {
          const parsed = JSON.parse(editValue) as { address?: boolean; companyAddress?: boolean; email?: boolean; phone?: boolean }
          setBusinessVisibility(prev => ({
            address: parsed.address ?? prev.address,
            companyAddress: parsed.companyAddress ?? prev.companyAddress,
            email: parsed.email ?? prev.email,
            phone: parsed.phone ?? prev.phone
          }))
        } catch {}
        break
      }
    }
    closeEditModal()
  }

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'quotationNumber':
        return t('quotationNumber') || 'Quotation Number'
      case 'validUntil':
        return t('validUntil') || 'Valid Until'
      case 'taxPercentage':
        return t('taxPercentage') || 'Tax Percentage (%)'
      case 'introductoryText':
        return 'Introductory Text'
      case 'terms':
        return t('terms') || 'Terms & Conditions'
      case 'notes':
        return t('notes') || 'Notes'
      case 'profileImageStyle':
        return 'Profile Image Style'
      case 'businessVisibility':
        return 'Business Details Visibility'
      default:
        return field
    }
  }

  const getFieldValue = (field: string) => {
    switch (field) {
      case 'quotationNumber':
        return quotationNumber
      case 'validUntil':
        return validUntil || 'Not set'
      case 'taxPercentage':
        return `${taxPercentage}%`
      case 'introductoryText':
        return introductoryText.length > 50 ? `${introductoryText.substring(0, 50)}...` : introductoryText
      case 'terms':
        return terms.length > 50 ? `${terms.substring(0, 50)}...` : terms || 'Not set'
      case 'notes':
        return notes.length > 50 ? `${notes.substring(0, 50)}...` : notes || 'Not set'
      case 'profileImageStyle':
        return `${profileImageShape === 'circle' ? 'Circle' : 'Square'}, ${
          profileImageSize === 'sm' ? 'Small' : profileImageSize === 'lg' ? 'Large' : 'Medium'
        }`
      case 'businessVisibility': {
        const parts: string[] = []
        if (businessVisibility.address) parts.push('Address')
        if (businessVisibility.companyAddress) parts.push('Company Address')
        if (businessVisibility.email) parts.push('Email')
        if (businessVisibility.phone) parts.push('Phone')
        return parts.length ? parts.join(', ') : 'Nothing visible'
      }
      default:
        return ''
    }
  }

  const saveQuotation = async () => {
    // TODO: Implement save functionality
    console.log('Saving quotation...')
  }

  const openItemsModal = () => {
    setShowItemsModal(true)
  }

  const closeItemsModal = () => {
    setShowItemsModal(false)
  }

  const addNewItem = () => {
    const newId = Math.max(...editableItems.map(item => item.id), 0) + 1
    const newItem: EditableItem = {
      id: newId,
      name: '',
      description: '',
      price: 0,
      quantity: 1,
      priceType: 'fixed',
      priceUnit: null,
      isEditable: true
    }
    setEditableItems(prev => [...prev, newItem])
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">
                {t('title') || 'Quotation Generator'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="text-xs text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors flex items-center gap-1"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-3 h-3" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          <div className="flex flex-col h-full min-h-0">
            {/* Main Content - 3 Column Layout */}
            <div className="flex-1 flex flex-col lg:flex-row lg:flex-nowrap gap-2 lg:gap-6 overflow-hidden relative min-h-0">
              
              {/* Left Panel - Settings */}
              <div className="w-full lg:basis-[20%] border-b lg:border-b-0 lg:border-r border-[var(--dashboard-border-primary)] flex flex-col">
                <div className="p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-3 md:mb-6">
                <Cog6ToothIcon className="w-5 h-5" />
                <h2 className={`text-base font-normal ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t('settings') || 'Settings'}
                </h2>
              </div>

              

                             {/* Settings Sections */}
               <div className="space-y-0">
                 {[
                   'profileImageStyle',
                   'businessVisibility',
                   'quotationNumber',
                   'validUntil', 
                   'taxPercentage',
                   'introductoryText'
                 ].map((field, index) => (
                   <div key={field}>
                     <div className="py-2 md:py-4">
                       <div className="flex justify-between items-start">
                         <div className="flex-1">
                           <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 md:mb-1 ${
                             theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                           }`} style={{ fontSize: '0.65rem' }}>
                             {getFieldLabel(field)}
                           </p>
                           <p className={`text-xs md:text-sm ${
                             theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                           }`}>
                             {getFieldValue(field)}
                           </p>
                         </div>
                         <button
                           onClick={() => {
                             let currentValue = ''
                             switch (field) {
                               case 'quotationNumber':
                                 currentValue = quotationNumber
                                 break
                               case 'validUntil':
                                 currentValue = validUntil
                                 break
                               case 'taxPercentage':
                                 currentValue = taxPercentage.toString()
                                 break
                               case 'introductoryText':
                                 currentValue = introductoryText
                                 break
                               case 'terms':
                                 currentValue = terms
                                 break
                               case 'notes':
                                 currentValue = notes
                                 break
                          }
                          if (field === 'profileImageStyle') {
                            openEditModal('profileImageStyle', `${profileImageShape}|${profileImageSize}`)
                          } else if (field === 'businessVisibility') {
                            openEditModal('businessVisibility', JSON.stringify(businessVisibility))
                          } else {
                            openEditModal(field, currentValue)
                          }
                           }}
                           className={`p-2 rounded-lg transition-colors ${
                             theme === 'dark' 
                               ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                           }`}
                           title="Edit"
                         >
                           <PencilIcon className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                     {index < 7 && (
                       <div className={`border-b ${
                         theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                       }`}></div>
                     )}
                   </div>
                 ))}

                 {/* Items Section */}
                 <div className="py-2 md:py-4">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 md:mb-1 ${
                         theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                       }`}>
                         Items ({editableItems.length})
                       </p>
                       <p className={`text-xs md:text-sm ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         {editableItems.length} items • €{calculateSubtotal().toFixed(2)} subtotal
                       </p>
                     </div>
                     <button
                       onClick={openItemsModal}
                       className={`p-2 rounded-lg transition-colors ${
                         theme === 'dark' 
                           ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                           : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                       }`}
                       title="Edit Items"
                     >
                       <PencilIcon className="w-4 h-4" />
                     </button>
                   </div>
                 </div>

                 {/* Terms Section */}
                 <div className="py-2 md:py-4">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 md:mb-1 ${
                         theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                       }`} style={{ fontSize: '0.65rem' }}>
                         {getFieldLabel('terms')}
                       </p>
                       <p className={`text-xs md:text-sm ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         {getFieldValue('terms')}
                       </p>
                     </div>
                     <button
                       onClick={() => openEditModal('terms', terms)}
                       className={`p-2 rounded-lg transition-colors ${
                         theme === 'dark' 
                           ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                           : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                       }`}
                       title="Edit"
                     >
                       <PencilIcon className="w-4 h-4" />
                     </button>
                   </div>
                 </div>

                 {/* Notes Section */}
                 <div className="py-2 md:py-4">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 md:mb-1 ${
                         theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                       }`} style={{ fontSize: '0.65rem' }}>
                         {getFieldLabel('notes')}
                       </p>
                       <p className={`text-xs md:text-sm ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         {getFieldValue('notes')}
                       </p>
                     </div>
                     <button
                       onClick={() => openEditModal('notes', notes)}
                       className={`p-2 rounded-lg transition-colors ${
                         theme === 'dark' 
                           ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                           : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                       }`}
                       title="Edit"
                     >
                       <PencilIcon className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>
                </div>
              </div>

              {/* Middle Panel - Document Preview */}
              <div className="w-full lg:basis-[48%] flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto p-2 lg:p-6 space-y-4 lg:space-y-5">
              <div className={`p-0 rounded-md ${
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-800'
                } shadow-lg`}>

              {/* Preview Content */}
                             <div 
                 ref={quotationRef}
                className={`quotation-preview p-4 md:p-10 bg-white rounded-md text-gray-900`}
                 style={{ margin: '0' }}
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
                              className={`${
                                profileImageSize === 'sm' ? 'w-12 h-12' : profileImageSize === 'lg' ? 'w-24 h-24' : 'w-20 h-20'
                              } ${profileImageShape === 'circle' ? 'rounded-full' : 'rounded-md'} object-cover`}
                            />
                          </div>
                        )}
                                                 <h1 className="text-base md:text-2xl font-bold text-gray-900">
                           {quotationData.business.name}
                         </h1>
                        {(businessVisibility.address || businessVisibility.companyAddress) && (
                           <p className="text-xs leading-tight text-gray-700">
                            {(businessVisibility.address && quotationData.business.address) || (businessVisibility.companyAddress && quotationData.business.companyAddress) || ''}
                           </p>
                         )}
                                                 {/* Business Contacts */}
                        {(businessVisibility.email || businessVisibility.phone) && (
                           <p className="text-xs leading-tight text-gray-700">
                            {businessVisibility.email && quotationData.business.email && cleanContactDisplay(quotationData.business.email)}
                            {businessVisibility.email && businessVisibility.phone && quotationData.business.email && quotationData.business.phone && ' • '}
                            {businessVisibility.phone && quotationData.business.phone && cleanContactDisplay(quotationData.business.phone)}
                           </p>
                         )}
                     </div>
                   </div>
                 </div>
                 
                                   {/* Customer Data on the right */}
                  <div className="text-right ml-8">
                                         <h3 className="text-xs md:text-lg mb-2 text-gray-900">
                       {t('customer') || 'Customer'}
                     </h3>
                                        <p className="text-xs md:text-lg font-bold text-gray-900">
                       {quotationData.customer.name}
                     </p>
                                                            {quotationData.customer.email && (
                       <p className="text-xs leading-tight text-gray-700">
                         {quotationData.customer.email}
                       </p>
                     )}
                     {quotationData.customer.phone && (
                       <p className="text-xs leading-tight text-gray-700">
                         {quotationData.customer.phone}
                       </p>
                     )}
                     {(quotationData.customer.address || quotationData.customer.city) && (
                       <p className="text-xs leading-tight text-gray-700">
                         {[quotationData.customer.address, quotationData.customer.city, quotationData.customer.region, quotationData.customer.country]
                           .filter(Boolean)
                           .join(', ')}
                       </p>
                     )}
                 </div>
               </div>

                                                               {/* Quotation Data - Document Subject Style */}
                                                      <div className="mb-8">
                     <div className="text-xs md:text-lg text-gray-900">
                       <span className="font-bold">{t('quotation') || 'QUOTATION'}</span>
                       <span className="text-xs"> N. {quotationNumber} of {formatDate(new Date())}</span>
                       {validUntil && (
                         <span className="text-xs">, valid until {new Date(validUntil).toLocaleDateString()}</span>
                       )}
                     </div>
                   </div>

                {/* Introductory Section */}
                                 <div className="mb-8">
                 <p className="text-xs md:text-base text-gray-700">
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
                                                                                                       <th className="text-left py-3 px-2 w-2/3 text-xs text-gray-900">
                             {t('item') || 'Item'}
                           </th>
                           <th className="text-right py-3 px-2 w-1/6 text-xs text-gray-900">
                             {t('price') || 'Price'}
                           </th>
                           <th className="text-center py-3 px-2 w-1/6 text-xs text-gray-900">
                             {t('quantity') || 'Qty'}
                           </th>
                           <th className="text-right py-3 px-2 w-1/6 text-xs text-gray-900">
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
                               <p className="text-xs md:text-base font-semibold text-gray-900">
                                 {item.name}
                               </p>
                             </td>
                                                                                                               <td className="py-3 px-2 text-right text-gray-900">
                                                               <span className="text-xs">
                                  €{item.price.toFixed(2)}
                                  {item.priceType !== 'fixed' && item.priceUnit && (
                                    <span className={`text-xs ${
                                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      /{item.priceUnit}
                                    </span>
                                  )}
                                </span>
                             </td>
                                                                                                               <td className="py-3 px-2 text-center text-xs text-gray-900">
                              {item.quantity}
                              {item.priceType !== 'fixed' && item.priceUnit && (
                                <span className={`text-xs block ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {item.priceUnit}
                                </span>
                              )}
                            </td>
                                                                                                               <td className="py-3 px-2 text-right font-medium text-xs md:text-base text-gray-900">
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
                                                                                                                               <div className="flex justify-between py-2 text-xs md:text-base text-gray-700">
                         <span>{t('subtotal') || 'Subtotal'}:</span>
                         <span className="text-sm md:text-lg font-medium">€{calculateSubtotal().toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between py-2 text-xs md:text-base text-gray-700">
                         <span>{t('tax') || 'Tax'} ({taxPercentage}%):</span>
                         <span className="text-sm md:text-lg font-medium">€{calculateTax().toFixed(2)}</span>
                       </div>
                     <div className="flex justify-between py-3 border-t-2 font-bold text-sm md:text-xl border-gray-300 text-gray-900">
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
                                                                                           <h3 className="text-xs md:text-lg font-semibold mb-2 text-gray-900">
                          {t('terms') || 'Terms & Conditions'}
                        </h3>
                        <p className="text-xs whitespace-pre-wrap text-gray-700">
                          {terms}
                        </p>
                    </div>
                  )}
                  {notes && (
                    <div className="mb-4">
                                                                                           <h3 className="text-xs md:text-lg font-semibold mb-2 text-gray-900">
                          {t('notes') || 'Notes'}
                        </h3>
                        <p className="text-xs whitespace-pre-wrap text-gray-700">
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
                                                                               <p className="text-xs text-gray-600">
                       Signature
                     </p>
                 </div>
               </div>
                </div>
              </div>
              </div>

              {/* Right Panel - Action Buttons */}
              <div className="w-full lg:basis-[30%] border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] flex flex-col">
                <div className="p-4 lg:p-6">
                  <div className="space-y-4">
                    {/* Save Button */}
                    <button
                      onClick={saveQuotation}
                      className="w-full p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                      title="Save quotation"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20">
                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[var(--dashboard-text-primary)]">
                          {t('save') || 'Save'}
                        </div>
                        <div className="text-xs text-[var(--dashboard-text-secondary)]">
                          Save quotation draft
                        </div>
                      </div>
                    </button>

                    {/* Generate PDF Button */}
                    <button
                      onClick={generatePDF}
                      disabled={isGenerating}
                      className={`w-full p-3 rounded-lg transition-colors flex flex-col items-start justify-start gap-2 border ${
                        isGenerating 
                          ? 'bg-gray-500/10 border-gray-500/20 cursor-not-allowed' 
                          : 'bg-black/10 hover:bg-black/20 border-white/20'
                      }`}
                      title="Generate PDF"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isGenerating ? 'bg-gray-500/20' : 'bg-green-500/20'
                      }`}>
                        <DocumentArrowDownIcon className={`w-4 h-4 ${
                          isGenerating ? 'text-gray-500' : 'text-green-500'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[var(--dashboard-text-primary)]">
                          {isGenerating ? (t('generating') || 'Generating...') : (t('generatePDF') || 'Generate PDF')}
                        </div>
                        <div className="text-xs text-[var(--dashboard-text-secondary)]">
                          {isGenerating ? 'Please wait...' : 'Download PDF document'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Edit {getFieldLabel(editingField)}
              </h3>
              
              {editingField === 'validUntil' ? (
                <input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`w-full p-2 rounded-lg border mb-4 ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : editingField === 'taxPercentage' ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`w-full p-2 rounded-lg border mb-4 ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : editingField === 'profileImageStyle' ? (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Shape</label>
                    <div className="flex gap-2">
                      {['circle','square'].map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setEditValue(`${shape}|${profileImageSize}`)}
                          className={`px-3 py-2 rounded border ${editValue.startsWith(shape) ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'border-zinc-600' : 'border-gray-300')}`}
                        >{shape}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Size</label>
                    <div className="flex gap-2">
                      {['sm','md','lg'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setEditValue(`${editValue.split('|')[0] || profileImageShape}|${size}`)}
                          className={`px-3 py-2 rounded border ${editValue.endsWith(size) ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'border-zinc-600' : 'border-gray-300')}`}
                        >{size.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : editingField === 'businessVisibility' ? (
                <div className="space-y-3 mb-4">
                  {([
                    { key: 'address', label: 'Address' },
                    { key: 'companyAddress', label: 'Company Address' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between gap-3">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                      <input
                        type="checkbox"
                        checked={(JSON.parse(editValue)[key] ?? (businessVisibility as any)[key]) as boolean}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(editValue)
                            parsed[key] = e.target.checked
                            setEditValue(JSON.stringify(parsed))
                          } catch {
                            const fallback = { ...businessVisibility, [key]: e.target.checked }
                            setEditValue(JSON.stringify(fallback))
                          }
                        }}
                        className="toggle toggle-sm"
                      />
                    </label>
                  ))}
                </div>
              ) : editingField === 'introductoryText' || editingField === 'terms' || editingField === 'notes' ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={4}
                  className={`w-full p-2 rounded-lg border mb-4 ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={`Enter ${getFieldLabel(editingField).toLowerCase()}...`}
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`w-full p-2 rounded-lg border mb-4 ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 border-zinc-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={`Enter ${getFieldLabel(editingField).toLowerCase()}...`}
                />
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEditModal}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Items Modal */}
      {showItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Edit Items ({editableItems.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addNewItem}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    theme === 'dark' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <CheckIcon className="w-4 h-4" />
                  Add Item
                </button>
                <button
                  onClick={closeItemsModal}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {editableItems.map((item, index) => (
                <div key={item.id} className={`p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                                     <div className="grid grid-cols-12 gap-3 items-end">
                     {/* Item Name */}
                     <div className="col-span-3">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Item Name
                       </label>
                       <input
                         type="text"
                         value={item.name}
                         onChange={(e) => {
                           setEditableItems(prev => prev.map(i =>
                             i.id === item.id ? { ...i, name: e.target.value } : i
                           ))
                         }}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                         placeholder="Enter item name"
                       />
                     </div>

                     {/* Notes */}
                     <div className="col-span-2">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Notes
                       </label>
                       <input
                         type="text"
                         value={item.description || ''}
                         onChange={(e) => {
                           setEditableItems(prev => prev.map(i =>
                             i.id === item.id ? { ...i, description: e.target.value } : i
                           ))
                         }}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                         placeholder="Optional notes"
                       />
                     </div>

                     {/* Price Type */}
                     <div className="col-span-2">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Price Type
                       </label>
                       <select
                         value={item.priceType}
                         onChange={(e) => {
                           setEditableItems(prev => prev.map(i =>
                             i.id === item.id ? { ...i, priceType: e.target.value } : i
                           ))
                         }}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                       >
                         <option value="fixed">Fixed</option>
                         <option value="per_unit">Per Unit</option>
                         <option value="per_hour">Per Hour</option>
                         <option value="per_day">Per Day</option>
                       </select>
                     </div>

                     {/* Price Unit */}
                     <div className="col-span-2">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Price Unit
                       </label>
                       <input
                         type="text"
                         value={item.priceUnit || ''}
                         onChange={(e) => {
                           setEditableItems(prev => prev.map(i =>
                             i.id === item.id ? { ...i, priceUnit: e.target.value } : i
                           ))
                         }}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                         placeholder="e.g., piece, hour"
                       />
                     </div>

                     {/* Quantity */}
                     <div className="col-span-1">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Qty
                       </label>
                       <input
                         type="number"
                         min="1"
                         value={item.quantity}
                         onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                       />
                     </div>

                     {/* Price */}
                     <div className="col-span-1">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Price (€)
                       </label>
                       <input
                         type="number"
                         min="0"
                         step="0.01"
                         value={item.price}
                         onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                         className={`w-full p-2 rounded-lg border text-sm ${
                           theme === 'dark' 
                             ? 'bg-zinc-600 border-zinc-500 text-gray-100' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                       />
                     </div>

                     {/* Total */}
                     <div className="col-span-1">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>
                         Total
                       </label>
                       <p className={`text-sm font-medium p-2 ${
                         theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                       }`}>
                         €{(item.price * item.quantity).toFixed(2)}
                       </p>
                     </div>
                   </div>

                  {/* Remove Button */}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Subtotal: €{calculateSubtotal().toFixed(2)}
              </div>
              <button
                onClick={closeItemsModal}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
