import { useState } from "react"
import { 
  ALLOWED_PAYMENT_METHODS, 
  PAYMENT_METHOD_CATEGORIES,
  getPaymentMethodsByCategory 
} from "@/lib/payment-methods-config"
import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface PaymentMethod {
  type: string
  visible: boolean
  details?: Record<string, string>
}

interface ProfilePaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[]
  onChange: (methods: PaymentMethod[]) => void
}

export default function ProfilePaymentMethodsSection({ paymentMethods, onChange }: ProfilePaymentMethodsSectionProps) {
  const t = useTranslations("profile")
  // Use only IDs for selection
  const [selected, setSelected] = useState<string[]>(paymentMethods.map((m) => m.type))

  const handleToggle = (id: string) => {
    let updated: string[]
    let updatedMethods: PaymentMethod[]
    if (selected.includes(id)) {
      updated = selected.filter((s) => s !== id)
      updatedMethods = paymentMethods.filter((m) => m.type !== id)
    } else {
      updated = [...selected, id]
      updatedMethods = [
        ...paymentMethods,
        { type: id, visible: true, details: {} },
      ]
    }
    setSelected(updated)
    onChange(updatedMethods)
  }

  const handleVisibilityToggle = (id: string) => {
    const updated = paymentMethods.map((m) =>
      m.type === id ? { ...m, visible: !m.visible } : m
    )
    onChange(updated)
  }

  const handleInputChange = (methodId: string, field: string, value: string) => {
    const updated = paymentMethods.map((m) =>
      m.type === methodId
        ? { ...m, details: { ...m.details, [field]: value } }
        : m
    )
    onChange(updated)
  }

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("paymentMethods.title") || "Payment Methods"}</h3>
        
        {/* Online Payment Methods */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-800 mb-3">{PAYMENT_METHOD_CATEGORIES[0].name}</h4>
          <p className="text-sm text-gray-600 mb-4">{PAYMENT_METHOD_CATEGORIES[0].description}</p>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 mb-6">
            {getPaymentMethodsByCategory('online').map((method) => {
              const isActive = selected.includes(method.id)
              return (
                <button
                  key={method.id}
                  type="button"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all focus:outline-none h-24 ${
                    isActive
                      ? "ring-2 ring-gray-400 bg-gray-100 shadow-md"
                      : "border border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                  onClick={() => handleToggle(method.id)}
                >
                  <img 
                    src={method.iconPath} 
                    alt={method.name} 
                    className="w-12 h-12 mb-2" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textElement = e.currentTarget.nextElementSibling;
                      if (textElement) {
                        textElement.classList.remove('text-xs', 'font-bold', 'text-gray-400');
                        textElement.classList.add('text-lg', 'font-semibold', 'text-gray-300');
                      }
                    }}
                  />
                  <span className="text-xs font-bold text-gray-400">{method.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* In-Person Payment Methods */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-800 mb-3">{PAYMENT_METHOD_CATEGORIES[1].name}</h4>
          <p className="text-sm text-gray-600 mb-4">{PAYMENT_METHOD_CATEGORIES[1].description}</p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {getPaymentMethodsByCategory('in-person').map((method) => {
            const isActive = selected.includes(method.id)
            return (
              <button
                key={method.id}
                type="button"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all focus:outline-none h-24 ${
                  isActive
                    ? "ring-2 ring-gray-400 bg-gray-100 shadow-md"
                    : "border border-gray-300 hover:border-gray-400 bg-white"
                }`}
                onClick={() => handleToggle(method.id)}
              >
                  <img 
                    src={method.iconPath} 
                    alt={method.name} 
                    className="w-12 h-12 mb-2" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textElement = e.currentTarget.nextElementSibling;
                      if (textElement) {
                        textElement.classList.remove('text-xs', 'font-bold', 'text-gray-400');
                        textElement.classList.add('text-lg', 'font-semibold', 'text-gray-300');
                      }
                    }}
                  />
                  <span className="text-xs font-bold text-gray-400">{method.name}</span>
              </button>
            )
          })}
          </div>
        </div>
        <div className="space-y-4">
          {selected.map((id) => {
            const config = ALLOWED_PAYMENT_METHODS.find((pm) => pm.id === id)
            const method = paymentMethods.find((m) => m.type === id)
            if (!config || !config.fields || config.fields.length === 0 || !method) return null
            return (
              <div key={id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                <img src={config.iconPath} alt={config.name} className="w-6 h-6" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.fields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                      <label className="text-xs font-medium mb-1" htmlFor={`${id}-${field.name}`}>{field.label}</label>
                      <input
                        id={`${id}-${field.name}`}
                        type={field.type}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={field.placeholder || field.label}
                        value={method.details?.[field.name] || ""}
                        required={field.required}
                        onChange={(e) => handleInputChange(id, field.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  onClick={() => handleToggle(id)}
                  title={t("paymentMethods.remove")}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
