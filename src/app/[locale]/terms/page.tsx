'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  CreditCard,
  RefreshCw,
  Ban,
  Scale,
  Mail,
  ExternalLink,
  Users,
  Lock,
  AlertCircle,
  ArrowLeft
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

export default function TermsOfServicePage() {
  const t = useTranslations('Terms')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false)

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
      id: 'acceptance',
      icon: CheckCircle,
      titleKey: 'sections.acceptance.title',
      contentKey: 'sections.acceptance.content'
    },
    {
      id: 'definitions',
      icon: FileText,
      titleKey: 'sections.definitions.title',
      contentKey: 'sections.definitions.content'
    },
    {
      id: 'account',
      icon: Users,
      titleKey: 'sections.account.title',
      contentKey: 'sections.account.content'
    },
    {
      id: 'subscription',
      icon: CreditCard,
      titleKey: 'sections.subscription.title',
      contentKey: 'sections.subscription.content'
    },
    {
      id: 'usage',
      icon: Shield,
      titleKey: 'sections.usage.title',
      contentKey: 'sections.usage.content'
    },
    {
      id: 'prohibited',
      icon: Ban,
      titleKey: 'sections.prohibited.title',
      contentKey: 'sections.prohibited.content'
    },
    {
      id: 'intellectual-property',
      icon: Lock,
      titleKey: 'sections.intellectualProperty.title',
      contentKey: 'sections.intellectualProperty.content'
    },
    {
      id: 'liability',
      icon: Scale,
      titleKey: 'sections.liability.title',
      contentKey: 'sections.liability.content'
    },
    {
      id: 'termination',
      icon: XCircle,
      titleKey: 'sections.termination.title',
      contentKey: 'sections.termination.content'
    },
    {
      id: 'changes',
      icon: RefreshCw,
      titleKey: 'sections.changes.title',
      contentKey: 'sections.changes.content'
    },
    {
      id: 'governing-law',
      icon: Scale,
      titleKey: 'sections.governingLaw.title',
      contentKey: 'sections.governingLaw.content'
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
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base md:text-xl font-medium text-gray-900">Legal Center</h1>
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

          {/* Title and Subtitle */}
          <div className="mt-8 md:mt-12 max-w-5xl mx-auto pb-12">
            {/* Title */}
            <div className="mb-4">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                {t('title')}
              </h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto sm:px-4 md:px-6 lg:px-8 -mt-16 md:-mt-20 pb-16">
        {/* Content Sections */}
        <div className="bg-white/80 backdrop-blur-sm rounded-none sm:rounded-3xl shadow-xl border-x-0 sm:border-x border-y border-gray-200 overflow-hidden">
          {/* Terms of Service Header Inside Card */}
          <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('title')}
                </h2>
                <span className="text-xs md:text-sm text-gray-500 font-medium mt-1 block">
                  {t('effectiveDate')}: January 2025
                </span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Sections Content */}
          <div>
          {sections.map((section, index) => {
            const Icon = section.icon
            const isWorkInProgress = section.id === 'contact' || section.id === 'liability' || section.id === 'governing-law'
            
            return (
              <div 
                key={section.id}
                className={`p-6 md:p-8 ${index !== sections.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
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
                
                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: t.raw(section.contentKey) }} />
                </div>

                {/* Special content for specific sections */}
                {section.id === 'prohibited' && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-600" />
                      {t('prohibited.listTitle')}
                    </h4>
                    <ul className="space-y-2 text-sm md:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item3')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item4')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item5')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{t('prohibited.item6')}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {section.id === 'subscription' && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base">
                          {t('subscription.payment.title')}
                        </h5>
                      </div>
                      <p className="text-xs md:text-sm text-gray-700">
                        {t('subscription.payment.desc')}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-green-600" />
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base">
                          {t('subscription.renewal.title')}
                        </h5>
                      </div>
                      <p className="text-xs md:text-sm text-gray-700">
                        {t('subscription.renewal.desc')}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-orange-600" />
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base">
                          {t('subscription.cancellation.title')}
                        </h5>
                      </div>
                      <p className="text-xs md:text-sm text-gray-700">
                        {t('subscription.cancellation.desc')}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base">
                          {t('subscription.refunds.title')}
                        </h5>
                      </div>
                      <p className="text-xs md:text-sm text-gray-700">
                        {t('subscription.refunds.desc')}
                      </p>
                    </div>
                  </div>
                )}

                {section.id === 'termination' && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                          {t('termination.warning.title')}
                        </h5>
                        <p className="text-xs md:text-sm text-gray-700">
                          {t('termination.warning.desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>
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
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t('footer.privacy')}
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/support" className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t('footer.support')}
            </Link>
            <span className="text-gray-400">•</span>
            <a 
              href="https://europa.eu/youreurope/business/dealing-with-customers/consumer-contracts/distance-contracts/index_en.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              {t('footer.euConsumerRights')} <ExternalLink className="w-3 h-3" />
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

