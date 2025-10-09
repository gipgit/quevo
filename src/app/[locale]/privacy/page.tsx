'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Lock, 
  Database, 
  Globe, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Mail,
  FileText,
  Clock,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  ArrowLeft,
  CreditCard
} from 'lucide-react'
import { LocaleSwitcherButton } from '@/components/ui/LocaleSwitcherButton'
import { LocaleSelectModal } from '@/components/ui/LocaleSelectModal'
import LandingSupportCard from '@/components/landing/LandingSupportCard'

type SectionItem = {
  id: string
  icon: any
  titleKey: string
  contentKey: string
}

export default function PrivacyPolicyPage() {
  const t = useTranslations('Privacy')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'formal' | 'visual'>('visual')

  const availableLocales = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ]

  const handleLocaleChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
    setIsLocaleModalOpen(false)
  }

  const sections: SectionItem[] = [
    {
      id: 'introduction',
      icon: FileText,
      titleKey: 'sections.introduction.title',
      contentKey: 'sections.introduction.content'
    },
    {
      id: 'controller',
      icon: UserCheck,
      titleKey: 'sections.controller.title',
      contentKey: 'sections.controller.content'
    },
    {
      id: 'data-collected',
      icon: Database,
      titleKey: 'sections.dataCollected.title',
      contentKey: 'sections.dataCollected.content'
    },
    {
      id: 'purposes',
      icon: CheckCircle,
      titleKey: 'sections.purposes.title',
      contentKey: 'sections.purposes.content'
    },
    {
      id: 'legal-basis',
      icon: Shield,
      titleKey: 'sections.legalBasis.title',
      contentKey: 'sections.legalBasis.content'
    },
    {
      id: 'third-parties',
      icon: Globe,
      titleKey: 'sections.thirdParties.title',
      contentKey: 'sections.thirdParties.content'
    },
    {
      id: 'international-transfers',
      icon: Globe,
      titleKey: 'sections.internationalTransfers.title',
      contentKey: 'sections.internationalTransfers.content'
    },
    {
      id: 'retention',
      icon: Clock,
      titleKey: 'sections.retention.title',
      contentKey: 'sections.retention.content'
    },
    {
      id: 'your-rights',
      icon: UserCheck,
      titleKey: 'sections.yourRights.title',
      contentKey: 'sections.yourRights.content'
    },
    {
      id: 'security',
      icon: Lock,
      titleKey: 'sections.security.title',
      contentKey: 'sections.security.content'
    },
    {
      id: 'cookies',
      icon: Eye,
      titleKey: 'sections.cookies.title',
      contentKey: 'sections.cookies.content'
    },
    {
      id: 'contact',
      icon: Mail,
      titleKey: 'sections.contact.title',
      contentKey: 'sections.contact.content'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* Page Background Gradient Layers - More at Bottom */}
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(160deg, rgb(224, 242, 254) 0%, rgb(224, 231, 255) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.25,
          height: '600px',
          left: '-200px',
          top: '60%',
          width: '700px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(200deg, rgb(243, 232, 255) 0%, rgb(219, 234, 254) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.25,
          height: '550px',
          right: '-150px',
          top: '70%',
          width: '650px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(180deg, rgb(236, 254, 255) 0%, rgb(240, 253, 244) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.2,
          height: '500px',
          left: '50%',
          bottom: '50px',
          transform: 'translateX(-50%)',
          width: '600px'
        }}
      ></div>

      {/* Hero Header */}
      <header className="relative overflow-hidden z-10 pb-8 md:pb-12" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
        {/* Gradient Layer 1 - Bottom Left */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(143.241deg, rgb(147, 197, 253) 0%, rgb(196, 181, 253) 50%, rgb(167, 243, 208) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.45,
            height: '400px',
            left: '-150px',
            bottom: '-100px',
            width: '500px'
          }}
        ></div>
        
        {/* Gradient Layer 2 - Bottom Right */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(140.017deg, rgb(221, 214, 254) 0%, rgb(147, 197, 253) 60%, rgb(129, 140, 248) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.4,
            height: '350px',
            right: '-100px',
            bottom: '-80px',
            width: '450px'
          }}
        ></div>
        
        {/* Bottom Center Accent Layer */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(90deg, rgb(186, 230, 253) 0%, rgb(191, 219, 254) 100%)',
            filter: 'blur(40px)',
            opacity: 0.35,
            height: '150px',
            bottom: '-50px',
            left: '0',
            width: '100%',
            borderRadius: '100%'
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base md:text-xl font-medium text-gray-900">Privacy Center</h1>
            </div>

            {/* Right: Locale Switcher + Back Button */}
            <div className="flex items-center gap-2 md:gap-3">
              <LocaleSwitcherButton 
                onClick={() => setIsLocaleModalOpen(true)}
                className="p-2 hover:bg-white/40 rounded-lg transition-colors"
              />
              <Link
                href="/"
                className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white/40 transition-all text-xs md:text-sm font-medium"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{t('backToHome')}</span>
              </Link>
            </div>
          </div>

          {/* Subtitle and Privacy Practice Cards */}
          <div className="mt-8 md:mt-12 max-w-5xl mx-auto pb-12">
            {/* Subtitle */}
            <div className="mb-8">
              <p className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {t('subtitle')}
              </p>
            </div>

            {/* Privacy Practice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* GDPR Compliance */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.gdprCompliance.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.gdprCompliance.description')}
                </p>
              </div>
            </div>

            {/* Data Minimization */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.dataMinimization.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.dataMinimization.description')}
                </p>
              </div>
            </div>

            {/* AI Privacy Protection */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.aiProtection.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.aiProtection.description')}
                </p>
              </div>
            </div>

            {/* EU Storage */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.euStorage.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.euStorage.description')}
                </p>
              </div>
            </div>

            {/* Transparency */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.transparency.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.transparency.description')}
                </p>
              </div>
            </div>

            {/* Your Control */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1.5">
                  {t('practices.yourControl.title')}
                </h4>
                <p className="text-gray-700 text-xs leading-snug">
                  {t('practices.yourControl.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto sm:px-4 md:px-6 lg:px-8 -mt-16 md:-mt-20 pb-16">
        {/* Content Sections */}
        <div className="bg-white/80 backdrop-blur-sm rounded-none sm:rounded-3xl shadow-xl border-x-0 sm:border-x border-y border-gray-200 overflow-hidden">
          {/* Privacy Policy Header Inside Card */}
          <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('title')}
                </h2>
                <span className="text-xs md:text-sm text-gray-500 font-medium mt-1 block">
                  {t('lastUpdated')}: January 2025
                </span>
              </div>
              <div className="flex items-center">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('formal')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'formal'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('viewMode.formal')}
                  </button>
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'visual'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('viewMode.visual')}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl leading-relaxed">
              {t('description')}
            </p>
          </div>

          {viewMode === 'formal' ? (
            // Formal Text Version - No Cards, Only Text
            sections.map((section, index) => {
              const Icon = section.icon
              const isWorkInProgress = section.id === 'controller' || section.id === 'contact'
              
              return (
                <div 
                  key={section.id}
                  className={`p-6 md:p-8 ${index !== sections.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        {t(section.titleKey)}
                      </h2>
                      {isWorkInProgress && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg mb-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-700" />
                          <span className="text-xs font-semibold text-yellow-800">
                            WORK IN PROGRESS
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Only show HTML content, no special cards */}
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: t.raw(section.contentKey) }} />
                  </div>
                </div>
              )
            })
          ) : (
            // Visual Cards Version
            <div className="p-6 md:p-8 space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon
                const isWorkInProgress = section.id === 'controller' || section.id === 'contact'
                
                return (
                  <div key={section.id} className={`space-y-4 ${index !== sections.length - 1 ? 'pb-8 border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {t(section.titleKey)}
                      </h2>
                      {isWorkInProgress && (
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <AlertTriangle className="w-3 h-3 text-yellow-700" />
                          <span className="text-[10px] font-semibold text-yellow-800">WIP</span>
                        </div>
                      )}
                    </div>

                    {/* Visual Card Content Based on Section */}
                    {section.id === 'data-collected' && (
                      <div className="space-y-4">
                        {/* Data Category Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm">User Registration Data</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Identity: Name, email</li>
                            <li>• Demographics: Birth date, country, gender</li>
                            <li>• Location: Address, city, region</li>
                            <li>• Account: Email, hashed password</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Business Information</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Company name, VAT number</li>
                            <li>• Business contact info</li>
                            <li>• Profile & cover images</li>
                            <li>• Business description</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Service Usage Data</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Service requests & quotations</li>
                            <li>• Appointments scheduled</li>
                            <li>• Documents uploaded</li>
                            <li>• Support tickets</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Payment Information</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Card brand & last 4 digits</li>
                            <li>• Billing address</li>
                            <li>• Subscription status</li>
                            <li>• Via Stripe (PCI-DSS compliant)</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm">AI Interaction Data</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Messages (max 100 chars)</li>
                            <li>• Conversation history</li>
                            <li>• AI responses</li>
                            <li>• ⚠️ No personal data sent to AI</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Technical & Usage Data</h4>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• IP address, browser type</li>
                            <li>• Device information</li>
                            <li>• Pages visited, timestamps</li>
                            <li>• Error logs, performance data</li>
                          </ul>
                        </div>
                        </div>

                        {/* Data Minimization Highlight */}
                        <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/30 border border-gray-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-green-200/50">
                              <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Data Minimization Practice</h4>
                              <p className="text-gray-700 text-xs md:text-sm">
                                We follow the GDPR principle of data minimization - collecting only what's necessary. AI features are limited to 100 characters max, and we <strong>NEVER</strong> send customer personal data (names, emails, phone numbers) to AI services.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* AI Privacy Guarantee */}
                        <div className="p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-gray-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-200/50">
                              <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">AI Privacy Guarantee</h4>
                              <p className="text-gray-700 text-xs">
                                When using AI for support responses, service request analysis, or marketing content generation, we <strong>NEVER</strong> share customer personal data with AI providers. Only anonymized service descriptions and business context are sent to AI services (OpenAI). Customer names, emails, phone numbers, and other personal identifiers are stripped before any AI processing.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'third-parties' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-5 h-5 text-gray-700" />
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{t('thirdParties.database.name')}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2"><strong>Purpose:</strong> {t('thirdParties.database.purpose')}</p>
                          <p className="text-xs text-gray-600 mb-2"><strong>Location:</strong> {t('thirdParties.database.location')}</p>
                          <p className="text-xs text-gray-600"><strong>Data:</strong> {t('thirdParties.database.data')}</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{t('thirdParties.cloudflare.name')}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2"><strong>Purpose:</strong> {t('thirdParties.cloudflare.purpose')}</p>
                          <p className="text-xs text-gray-600 mb-2"><strong>Location:</strong> {t('thirdParties.cloudflare.location')}</p>
                          <p className="text-xs text-gray-600"><strong>Data:</strong> {t('thirdParties.cloudflare.data')}</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{t('thirdParties.stripe.name')}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2"><strong>Purpose:</strong> {t('thirdParties.stripe.purpose')}</p>
                          <p className="text-xs text-gray-600 mb-2"><strong>Location:</strong> {t('thirdParties.stripe.location')}</p>
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 flex items-start gap-2">
                            <Shield className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{t('thirdParties.stripe.safeguards')}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{t('thirdParties.openai.name')}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2"><strong>Purpose:</strong> {t('thirdParties.openai.purpose')}</p>
                          <p className="text-xs text-gray-600 mb-2"><strong>Location:</strong> {t('thirdParties.openai.location')}</p>
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 flex items-start gap-2">
                            <Shield className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span>{t('thirdParties.openai.safeguards')}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-5 h-5 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{t('thirdParties.email.name')}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2"><strong>Purpose:</strong> {t('thirdParties.email.purpose')}</p>
                          <p className="text-xs text-gray-600 mb-2"><strong>Location:</strong> {t('thirdParties.email.location')}</p>
                          <p className="text-xs text-gray-600"><strong>Data:</strong> {t('thirdParties.email.data')}</p>
                        </div>
                      </div>
                    )}

                    {section.id === 'your-rights' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Download className="w-4 h-4 text-blue-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.access.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.access.desc')}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.rectification.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.rectification.desc')}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.erasure.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.erasure.desc')}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.portability.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.portability.desc')}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-orange-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.restriction.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.restriction.desc')}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-indigo-600" />
                            <h5 className="font-medium text-gray-900 text-sm">{t('rights.objection.title')}</h5>
                          </div>
                          <p className="text-xs text-gray-700">{t('rights.objection.desc')}</p>
                        </div>
                      </div>
                    )}

                    {section.id === 'retention' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Active Accounts</h4>
                          </div>
                          <p className="text-xs text-gray-700">Duration of subscription + 2 years after closure</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm">AI Conversations</h4>
                          </div>
                          <p className="text-xs text-gray-700">12 months, then automatically deleted</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Payment Records</h4>
                          </div>
                          <p className="text-xs text-gray-700">10 years (Italian legal requirement)</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Support Tickets</h4>
                          </div>
                          <p className="text-xs text-gray-700">2 years after resolution</p>
                        </div>
                      </div>
                    )}

                    {section.id === 'security' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Encryption</h4>
                          </div>
                          <p className="text-xs text-gray-700">HTTPS/TLS for all data in transit</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-green-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Password Protection</h4>
                          </div>
                          <p className="text-xs text-gray-700">Bcrypt hashing for secure storage</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Access Controls</h4>
                          </div>
                          <p className="text-xs text-gray-700">Role-based authentication</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Secure Storage</h4>
                          </div>
                          <p className="text-xs text-gray-700">Time-limited signed URLs for private files</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-green-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Regular Backups</h4>
                          </div>
                          <p className="text-xs text-gray-700">Automated encrypted backups</p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm">24/7 Monitoring</h4>
                          </div>
                          <p className="text-xs text-gray-700">Security logging and monitoring</p>
                        </div>
                      </div>
                    )}

                    {/* For other sections, show simplified text */}
                    {section.id !== 'data-collected' && section.id !== 'third-parties' && section.id !== 'your-rights' && section.id !== 'retention' && section.id !== 'security' && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: t.raw(section.contentKey) }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Support Section */}
        <LandingSupportCard 
          title={t('supportSection.title')}
          description={t('supportSection.description')}
          buttonText={t('supportSection.button')}
        />

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('footer.terms')}
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/support" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('footer.support')}
            </Link>
            <span className="text-gray-400">•</span>
            <a 
              href="https://www.gpdp.it/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              {t('footer.italianDPA')} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-gray-500">
            {t('footer.compliance')}
          </p>
        </div>
      </div>

      {/* Locale Switcher Modal */}
      <LocaleSelectModal
        isOpen={isLocaleModalOpen}
        onClose={() => setIsLocaleModalOpen(false)}
        currentLocale={locale}
        availableLocales={availableLocales}
        onLocaleSelect={handleLocaleChange}
      />
    </div>
  )
}

