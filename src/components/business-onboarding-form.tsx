"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ArrowPathIcon, XMarkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline"
import { BusinessInfoStep } from "./onboarding-steps/business-info-step"
import { BusinessUrlStep } from "./onboarding-steps/business-url-step"
import { BusinessLocationStep } from "./onboarding-steps/business-location-step"
import { ContactInfoStep } from "./onboarding-steps/contact-info-step"
import ImageUploadStep from "./onboarding-steps/image-upload-step"
import SocialLinksStep from "./onboarding-steps/social-links-step"
import LinkUrlsStep from "./onboarding-steps/link-urls-step"
import ProfileSettingsStep from "./onboarding-steps/profile-settings-step"
import ProfileColorsFontStep from "./onboarding-steps/profile-colors-font-step"
import { ConfirmationStep } from "./onboarding-steps/confirmation-step"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useBusiness } from "@/lib/business-context"

export interface BusinessFormData {
  // Step 1: Business Info
  business_name: string
  business_country: string

  // Step 2: URL
  business_urlname: string

  // Step 3: Location
  business_region: string
  business_city: string
  business_address: string

  // Step 4: Contact
  business_phone: string
  business_email: string

  // Step 5: Images
  profile_image: File | null
  cover_image_mobile: File | null
  cover_image_desktop: File | null

  // Step 6 & 7: Settings & Colors
  settings: {
    default_page: string
    theme_color_background: string
    theme_color_text: string
    theme_color_button: string
    theme_font: string
    show_address: boolean
    show_website: boolean
    show_socials: boolean
    show_btn_booking: boolean
    show_btn_payments: boolean
    show_btn_review: boolean
    show_btn_phone: boolean
    show_btn_email: boolean
    show_btn_order: boolean
  }

  // Step 8 & 9: Social Links
  selected_links: string[]
  link_urls: Record<string, string>
}

interface BusinessOnboardingFormProps {
  onFormDataChange?: (data: BusinessFormData) => void
  formData?: BusinessFormData
}

const STEPS = [
  { id: 1, name: "businessInfo", description: "" },
  { id: 2, name: "profileLink", description: "profileLinkDescription" },
  { id: 3, name: "location", description: "" },
  { id: 4, name: "contacts", description: "" },
  { id: 5, name: "images", description: "" },
  { id: 6, name: "profileSettings", description: "" },
  { id: 7, name: "colorsAndFont", description: "" },
  { id: 8, name: "socials", description: "selectSocials" },
  { id: 9, name: "socialLinks", description: "enterLinks" },
  { id: 10, name: "confirm", description: "reviewAndCreate" },
]

export function BusinessOnboardingForm({ onFormDataChange, formData: externalFormData }: BusinessOnboardingFormProps) {
  const router = useRouter()
  const t = useTranslations("BusinessOnboarding")
  const { addBusiness } = useBusiness()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionErrorDetails, setSubmissionErrorDetails] = useState<any>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: "",
    business_country: "",
    business_region: "",
    business_city: "",
    business_address: "",
    business_urlname: "",
    business_phone: "",
    business_email: "",
    profile_image: null,
    cover_image_mobile: null,
    cover_image_desktop: null,
    selected_links: [],
    link_urls: {},
    settings: {
      default_page: "services",
      theme_color_background: "#FFFFFF",
      theme_color_text: "#000000",
      theme_color_button: "#000000",
      theme_font: "1",
      show_address: true,
      show_website: true,
      show_socials: true,
      show_btn_booking: true,
      show_btn_payments: true,
      show_btn_review: true,
      show_btn_phone: true,
      show_btn_email: true,
      show_btn_order: false,
    },
  })

  // Use external form data if provided
  useEffect(() => {
    if (externalFormData) {
      setFormData(externalFormData)
    }
  }, [externalFormData])

  const updateFormData = useCallback((updates: Partial<BusinessFormData>) => {
    setFormData((prevFormData) => {
      const newFormData = { ...prevFormData, ...updates }
      onFormDataChange?.(newFormData)
      return newFormData
    })
  }, [onFormDataChange])

  const handleNext = () => {
    if (currentStep === 8 && formData.selected_links.length === 0) {
      // Skip step 9 if no social links selected
      setCurrentStep(10)
    } else if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
    setCanProceed(false)
  }

  const handlePrevious = () => {
    if (currentStep === 10 && formData.selected_links.length === 0) {
      // Skip step 9 when going back if no social links selected
      setCurrentStep(8)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleSubmit = async () => {
    setSubmissionModalOpen(true)
    setSubmissionError(null)
    setSubmissionErrorDetails(null)
    setSubmissionSuccess(false)
    setLoading(true)
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData()

      // Add business data
      submitData.append("business_name", formData.business_name)
      submitData.append("business_country", formData.business_country)
      submitData.append("business_region", formData.business_region || "")
      submitData.append("business_city", formData.business_city || "")
      submitData.append("business_address", formData.business_address || "")
      submitData.append("business_urlname", formData.business_urlname)
      

      submitData.append("business_phone", formData.business_phone || "[]")
      submitData.append("business_email", formData.business_email || "[]")

      // Add images
      if (formData.profile_image) {
        submitData.append("profile_image", formData.profile_image)
      }
          if (formData.cover_image_mobile) {
      submitData.append("cover_image_mobile", formData.cover_image_mobile)
    }
    if (formData.cover_image_desktop) {
      submitData.append("cover_image_desktop", formData.cover_image_desktop)
    }

      // Add social links
      submitData.append("selected_links", JSON.stringify(formData.selected_links))
      submitData.append("link_urls", JSON.stringify(formData.link_urls))

      // Add settings
      submitData.append("settings", JSON.stringify(formData.settings))

      const response = await fetch("/api/business/create-onboarding", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissionSuccess(true)
        
        // Switch to the newly created business if successful
        if (data.business?.business_id) {
          try {
            // Create a business object from the API response
            const newBusiness = {
              business_id: data.business.business_id,
              business_name: data.business.business_name,
              business_urlname: data.business.business_urlname,
              business_country: formData.business_country,
              business_region: formData.business_region || "",
              business_city: formData.business_city || "",
              business_address: formData.business_address || "",
              business_email: formData.business_email,
              business_phone: formData.business_phone,
              business_descr: "",
              business_img_profile: null,
              business_img_cover: null,
              business_public_uuid: data.business.business_id, // Using business_id as UUID for now
              date_created: new Date().toISOString(),
            }
            
            // Add the new business to the context and set it as current
            addBusiness(newBusiness)
            console.log("Successfully added new business to context:", data.business.business_id)
          } catch (error) {
            console.error("Error adding new business to context:", error)
            // Continue with redirect even if context update fails
          }
        }
        
        // Wait a moment to show success state, then redirect
        setTimeout(() => {
          router.push(`/dashboard/`)
        }, 1500)
      } else {
        let errorData
        let errorMessage = "Errore durante la creazione del business"
        
        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          // If response is not JSON, use status text
          errorData = { message: response.statusText }
          errorMessage = response.statusText || errorMessage
        }
        
        // Add more specific error messages based on status code
        if (response.status === 400) {
          errorMessage = "Dati non validi. Controlla i dettagli tecnici per maggiori informazioni."
        } else if (response.status === 401) {
          errorMessage = "Non autorizzato. Effettua nuovamente l'accesso."
        } else if (response.status === 409) {
          errorMessage = "Nome URL business già in uso. Scegli un nome diverso."
        } else if (response.status === 500) {
          errorMessage = "Errore interno del server. Riprova più tardi o contatta il supporto."
        }
        
        setSubmissionError(errorMessage)
        
        // Store detailed error information for debugging
        setSubmissionErrorDetails({
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmissionError("Errore di connessione. Riprova più tardi.")
      setSubmissionErrorDetails({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const closeSubmissionModal = () => {
    if (!loading) {
      setSubmissionModalOpen(false)
      setSubmissionError(null)
      setSubmissionErrorDetails(null)
      setSubmissionSuccess(false)
    }
  }

  const copyErrorDetails = () => {
    if (submissionErrorDetails) {
      const errorText = `Error: ${submissionError}\n\nTechnical Details:\n${JSON.stringify(submissionErrorDetails, null, 2)}`
      navigator.clipboard.writeText(errorText).then(() => {
        // You could add a toast notification here
        console.log('Error details copied to clipboard')
      }).catch(err => {
        console.error('Failed to copy error details:', err)
      })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 2:
        return <BusinessUrlStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 3:
        return <BusinessLocationStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 4:
        return <ContactInfoStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 5:
        return <ImageUploadStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 6:
        return <ProfileSettingsStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 7:
        return <ProfileColorsFontStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 8:
        return <SocialLinksStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 9:
        return <LinkUrlsStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      case 10:
        return <ConfirmationStep formData={formData} updateFormData={updateFormData} onValidationChange={setCanProceed} />
      default:
        return null
    }
  }

  return (
    <>
      {/* Step Header */}
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">{t(STEPS[currentStep - 1].name)}</h2>
        <p className="text-sm text-gray-500">{STEPS[currentStep - 1].description ? t(STEPS[currentStep - 1].description) : ""}</p>
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        {/* Progress Bar for xs to md - attached to bottom edge */}
        <div className="lg:hidden">
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-blue-600 h-1 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center min-w-0">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-3 lg:px-6 py-2.5 lg:py-3 text-base lg:text-base text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <ArrowLeftIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
              {t("back")}
            </button>

            {/* Progress Bar for lg+ - in the middle of navigation buttons */}
            <div className="hidden lg:flex flex-1 mx-4 justify-center min-w-0">
              <div className="w-full max-w-4xl bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex space-x-2 lg:space-x-3 flex-shrink-0">
              {(currentStep === 3 || currentStep === 4 || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 8 || currentStep === 9) && (
                <button onClick={handleSkip} className="px-3 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-white bg-gray-900 rounded-lg hover:bg-gray-200">
                  {t("skip")}
                </button>
              )}

              {currentStep === STEPS.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-4 lg:px-8 py-2.5 lg:py-3 text-base lg:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <ArrowPathIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 animate-spin" />
                      {t("creating")}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {t("createAndStart")}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed && currentStep !== 5}
                  className="flex items-center px-3 lg:px-6 py-2.5 lg:py-3 text-base lg:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    {t("next")}
                    <ArrowRightIcon className="w-4 h-4 lg:w-5 lg:h-5 ml-1 lg:ml-2" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

             {/* Submission Modal */}
       {submissionModalOpen && (
         <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999] p-4">
           <div className="p-6 w-full max-w-[700px] overflow-y-auto">
                         {loading && !submissionError && !submissionSuccess ? (
               // Loading state
               <div className="text-center py-4">
                 <LoadingSpinner size="lg" color="blue" />
                 <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                   Creazione Business in corso...
                 </h3>
                 <p className="text-xs text-gray-600">
                   Perfavore, attendi. Questo potrebbe richiedere alcuni secondi.
                 </p>
               </div>
                           ) : (
                 // Success or Error state
                 <div className="py-2 text-center">
                     {!loading && (
                       <button onClick={closeSubmissionModal} className="absolute right-0 top-0 text-gray-500 hover:text-gray-700">
                         <XMarkIcon className="h-6 w-6" />
                       </button>
                     )}
                
                {submissionError && (
                  <div className="px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Errore!</strong>
                    <span className="block sm:inline"> {submissionError}</span>
                    
                    {/* Show helpful suggestions */}
                    <div className="mt-2 text-sm">
                      <strong>Suggerimenti:</strong>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        <li>Controlla che tutti i campi obbligatori siano compilati</li>
                        <li>Verifica che il nome URL business non sia già in uso</li>
                        <li>Assicurati che i file immagine non siano troppo grandi</li>
                        <li>Se il problema persiste, copia i dettagli tecnici e contatta il supporto</li>
                      </ul>
                    </div>
                    
                    {/* Show detailed error information */}
                    {submissionErrorDetails && (
                      <div className="mt-3 pt-3 bg-red-100 border  text-red-700 border-t border-red-300">
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium hover:text-red-800">
                            Dettagli tecnici (clicca per espandere)
                          </summary>
                          <div className="mt-2 space-y-2">
                            {submissionErrorDetails.status && (
                              <div>
                                <strong>Status:</strong> {submissionErrorDetails.status} {submissionErrorDetails.statusText}
                              </div>
                            )}
                            
                            {submissionErrorDetails.errorData?.errors && (
                              <div>
                                <strong>Errori di validazione:</strong>
                                <ul className="list-disc list-inside mt-1 ml-2">
                                  {Object.entries(submissionErrorDetails.errorData.errors).map(([field, errors]: [string, any]) => (
                                    <li key={field}>
                                      <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {submissionErrorDetails.error && (
                              <div>
                                <strong>Errore tecnico:</strong> {submissionErrorDetails.error}
                              </div>
                            )}
                            
                            {submissionErrorDetails.timestamp && (
                              <div className="text-xs opacity-75">
                                <strong>Timestamp:</strong> {new Date(submissionErrorDetails.timestamp).toLocaleString('it-IT')}
                              </div>
                            )}
                            
                            {/* Show full error data for debugging */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between">
                                <strong>Dati completi:</strong>
                                <button
                                  onClick={copyErrorDetails}
                                  className="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded flex items-center gap-1"
                                  title="Copia dettagli errore"
                                >
                                  <ClipboardDocumentIcon className="w-3 h-3" />
                                  Copia
                                </button>
                              </div>
                              <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(submissionErrorDetails.errorData || submissionErrorDetails, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
                
                {submissionSuccess && (
                  <div className="text-center rounded relative mb-4" role="alert">
                    <span className="text-xl"> Il tuo business è stato creato!</span>
                  </div>
                )}
                
                                 {!loading && (
                   <div className="flex justify-center">
                     <button
                       onClick={closeSubmissionModal}
                       className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                     >
                       Chiudi
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      )}
    </>
  )
}
