"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useRouter } from "next/navigation"

interface MenuCategory {
  category_id: number
  category_name: string
}

interface ProductVariation {
  variation_name: string
  additional_description: string
  price_override?: number
  price_modifier?: number
}

export default function CreateProductPage() {
  const t = useTranslations("products")
  const router = useRouter()
  const { currentBusiness } = useBusiness()

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<Record<string, number> | null>(null)

  // Product basic info
  const [itemName, setItemName] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [itemNotes, setItemNotes] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [priceType, setPriceType] = useState("fixed")
  const [priceUnit, setPriceUnit] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageAvailable, setImageAvailable] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  // Variations
  const [variations, setVariations] = useState<ProductVariation[]>([])

  useEffect(() => {
    if (currentBusiness) {
      fetchMenuCategories()
    }
  }, [currentBusiness])

  useEffect(() => {
    if (currentBusiness?.plan?.plan_id) {
      fetch(`/api/plan-limits/${currentBusiness.plan.plan_id}`)
        .then((res) => res.json())
        .then((data) => setPlanLimits(data.limits))
        .catch(() => setPlanLimits(null))
    }
  }, [currentBusiness?.plan])

  const fetchMenuCategories = async () => {
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/menu-categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching menu categories:", error)
    }
  }

  const addVariation = () => {
    setVariations([
      ...variations,
      {
        variation_name: "",
        additional_description: "",
        price_modifier: 0,
      },
    ])
  }

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations]
    updated[index] = { ...updated[index], [field]: value }
    setVariations(updated)
  }

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index))
  }

  const canCreateProduct = () => {
    if (!planLimits) return false
    return planLimits.products === -1 || planLimits.products > 0 // You may want to check current count if available
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemName.trim()) {
      alert(t("productNameRequired"))
      return
    }

    if (!canCreateProduct()) {
      alert(t("productLimitReached"))
      return
    }

    setLoading(true)

    try {
      const productData = {
        item_name: itemName,
        category_id: categoryId,
        item_notes: itemNotes || null,
        item_description: itemDescription || null,
        price: price,
        price_type: priceType,
        price_unit: priceUnit || null,
        is_available: isAvailable,
        image_available: imageAvailable,
        image_url: imageUrl || null,
        variations: variations.filter((v) => v.variation_name.trim()),
      }

      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        router.push("/dashboard/products")
      } else {
        const error = await response.json()
        alert(error.message || t("createError"))
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert(t("createError"))
    } finally {
      setLoading(false)
    }
  }

  if (!currentBusiness) return null

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("createProduct")}</h1>
          <p className="text-gray-600 mt-2">{t("createProductDescription")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("basicInformation")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("productName")} *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("category")}</label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t("selectCategory")}</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("description")}</label>
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("notes")}</label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("price")} (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("priceType")}</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">{t("fixed")}</option>
                  <option value="per_unit">{t("perUnit")}</option>
                  <option value="per_weight">{t("perWeight")}</option>
                  <option value="per_portion">{t("perPortion")}</option>
                </select>
              </div>

              {priceType !== "fixed" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("priceUnit")}</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    placeholder={t("priceUnitPlaceholder")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("available")}</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={imageAvailable}
                      onChange={(e) => setImageAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t("hasImage")}</span>
                  </label>
                </div>
              </div>

              {imageAvailable && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("imageUrl")}</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variations Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("variations")}</h2>
              <button
                type="button"
                onClick={addVariation}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {t("addVariation")}
              </button>
            </div>

            {variations.map((variation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    {t("variation")} {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    {t("remove")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("variationName")}</label>
                    <input
                      type="text"
                      value={variation.variation_name}
                      onChange={(e) => updateVariation(index, "variation_name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("priceModifier")} (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variation.price_modifier || ""}
                      onChange={(e) =>
                        updateVariation(
                          index,
                          "price_modifier",
                          e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("additionalDescription")}</label>
                    <input
                      type="text"
                      value={variation.additional_description}
                      onChange={(e) => updateVariation(index, "additional_description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            {variations.length === 0 && <p className="text-gray-500 text-center py-4">{t("noVariations")}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? t("creating") : t("createProduct")}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
