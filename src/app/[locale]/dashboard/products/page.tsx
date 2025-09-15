"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeProvider"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import EmptyState from "@/components/EmptyState"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function ProductsPage() {
  const t = useTranslations("products")
  const tCommon = useTranslations("Common")
  const { currentBusiness, usage, planLimits, refreshUsageForFeature } = useBusiness()
  const { theme } = useTheme()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    if (currentBusiness && currentBusiness.business_id) {
      fetchProducts()
    }
  }, [currentBusiness])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      if (!currentBusiness?.business_id) throw new Error("No business selected")
      const response = await fetch(`/api/businesses/${currentBusiness.business_id}/products`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (productId: number) => {
    // Handle edit logic
  }

  const handleDelete = async (productId: number) => {
    try {
      if (!currentBusiness?.business_id) throw new Error("No business selected")
      const response = await fetch(`/api/businesses/${currentBusiness.business_id}/products/${productId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProducts(products.filter((p) => p.item_id !== productId))
        // Refresh usage data after successful deletion
        await refreshUsageForFeature("products")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return t("priceOnRequest")
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const planLimitProducts = planLimits?.find(l => l.feature === 'products' && l.limit_type === 'count' && l.scope === 'global')
  const currentUsage = usage?.products ?? 0
  const canCreateProduct = () => {
    if (!planLimitProducts) return false
    return canCreateMore(currentUsage, planLimitProducts)
  }

  if (!currentBusiness) return null

  // Group products by category (define before return)
  const productsByCategory = products.reduce(
    (acc, product) => {
      const categoryName = product.menucategory?.category_name || t("uncategorized")
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(product)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-xl lg:text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              {planLimitProducts && (
                <UsageLimitBar
                  current={currentUsage}
                  max={planLimitProducts.value}
                  label={formatUsageDisplay(currentUsage, planLimitProducts)}
                  showUpgrade={true}
                  onUpgrade={() => (window.location.href = "/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              )}
            </div>
            <div>
              <button
                className={`px-4 py-2 md:px-4 md:py-2 text-sm md:text-lg rounded-lg transition-colors inline-flex items-center gap-2 ${
                  canCreateProduct()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-zinc-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!canCreateProduct()}
                onClick={() => window.location.href = "/dashboard/products/create"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("addElement")}
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
            <div key={categoryName} className="mb-8">
              <h2 className={`text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{categoryName}</h2>
              <div className="space-y-6">
                {(categoryProducts as any[]).map((product: any) => (
                  <div
                    key={product.item_id}
                    className={`rounded-xl shadow-sm border overflow-hidden ${
                      theme === 'dark' 
                        ? 'bg-zinc-800 border-gray-600' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-zinc-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-gray-400 text-xs mb-1">No</div>
                              <div className="text-gray-400 text-xs">Immagine</div>
                            </div>
                          </div>
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-2 ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{product.item_name}</h3>
                              {product.item_description && <p className={`mb-3 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>{product.item_description}</p>}
                              <p className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{formatPrice(product.price)}</p>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                              <button
                                onClick={() => handleEdit(product.item_id)}
                                className="px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
                              >
                                {tCommon("edit")}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(product.item_id)}
                                className="px-3 py-1 text-sm border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                              >
                                {tCommon("delete")}
                              </button>
                            </div>
                          </div>
                          {/* Product Variations */}
                          {product.menuitemvariation && product.menuitemvariation.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              {product.menuitemvariation.map((variation: any) => (
                                <div
                                  key={variation.variation_id}
                                  className={`flex justify-between items-center text-sm mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                  }`}
                                >
                                  <span>
                                    {variation.variation_name} {variation.additional_description ? `- ${variation.additional_description}` : ""} (+{formatPrice(variation.price_override || variation.price_modifier)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        {products.length === 0 && !loading && (
          <EmptyState
            title={t("noProducts")}
            description={t("noProductsDescription")}
            buttonText={t("addElement")}
            onButtonClick={() => { /* You can replace this with your add product handler */ window.location.href = "/dashboard/products/create"; }}
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
