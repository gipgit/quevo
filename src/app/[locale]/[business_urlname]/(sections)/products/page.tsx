// src/app/[locale]/[business_urlname]/(sections)/products/page.tsx
// This is a Server Component, responsible for fetching and processing product data.

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProductsPageClientContent from '@/components/profile/sections/products/ProductsPageClientContent'; // Adjust import path if you moved the file
import EmptyState from '@/components/ui/EmptyState';

// Set revalidation time for products data (e.g., every 5 minutes, or based on how often products change)
export const revalidate = 300; // 5 minutes

export default async function ProductsSectionPage({ params }: { params: { business_urlname: string; locale: string } }) {
    const { business_urlname, locale } = params;
    const t = await getTranslations('Common');

    // Fetch ONLY the data relevant for the products section
    const businessData = await prisma.business.findUnique({
        where: { business_urlname: business_urlname },
        select: {
            business_public_uuid: true, // Needed for image URLs
            product: {
                include: { productvariation: { orderBy: { variation_name: 'asc' } }, productcategory: true },
                orderBy: { display_order: 'asc' }
            },
            productcategory: { orderBy: { display_order: 'asc' } },
        },
    });

    if (!businessData) {
        notFound();
    }

    // Process Menu Items (Products) - This logic was previously in layout.tsx
    const menuItemsByCategory: { [key: number]: any } = {};
    const allMenuCategories = businessData.productcategory || [];
    allMenuCategories.forEach(cat => {
        menuItemsByCategory[cat.category_id] = {
            category_id: cat.category_id,
            category_name: cat.category_name,
            display_order: cat.display_order,
            items: []
        };
    });

    const UNCAT_MENU_CATEGORY_ID = -1;
    if (!menuItemsByCategory[UNCAT_MENU_CATEGORY_ID]) {
        menuItemsByCategory[UNCAT_MENU_CATEGORY_ID] = {
            category_id: UNCAT_MENU_CATEGORY_ID,
            category_name: t('uncategorized'), // Translated 'Uncategorized'
            display_order: Infinity,
            items: []
        };
    }

    businessData.product?.forEach(item => {
        let itemImageUrl = null;
        if (item.image_available) {
            itemImageUrl = `/uploads/menu/${businessData.business_public_uuid}/item_${item.item_id}.webp`;
        }
        const processedItem = {
            ...item,
            price: item.price?.toString() || null,
            item_img: itemImageUrl,
            date_created: item.date_created?.toISOString() || null,
            date_update: item.date_update?.toISOString() || null,
            productcategory: item.productcategory ? {
                ...item.productcategory,
                date_created: item.productcategory.date_created?.toISOString() || null,
                date_update: item.productcategory.date_update?.toISOString() || null,
            } : null,
            productvariation: item.productvariation?.map((variation: any) => {
                let calculatedVariationPrice;
                if (variation.price_override !== null && variation.price_override !== undefined) {
                    calculatedVariationPrice = parseFloat(variation.price_override.toString());
                } else if (variation.price_modifier !== null && variation.price_modifier !== undefined) {
                    calculatedVariationPrice = (parseFloat(item.price?.toString() || '0') + parseFloat(variation.price_modifier?.toString() || '0'));
                } else {
                    calculatedVariationPrice = parseFloat(item.price?.toString() || '0');
                }
                return {
                    ...variation,
                    calculated_variation_price: calculatedVariationPrice?.toString() || null,
                    price_override: variation.price_override?.toString() || null,
                    price_modifier: variation.price_modifier?.toString() || null,
                    date_created: variation.date_created?.toISOString() || null,
                    date_update: variation.date_update?.toISOString() || null,
                };
            }) || [],
        };
        const targetCategoryId = processedItem.category_id || UNCAT_MENU_CATEGORY_ID;
        if (menuItemsByCategory[targetCategoryId]) {
            menuItemsByCategory[targetCategoryId].items.push(processedItem);
        } else {
            menuItemsByCategory[UNCAT_MENU_CATEGORY_ID].items.push(processedItem);
        }
    });

    const sortedMenuCategoriesWithItems = Object.values(menuItemsByCategory)
        .filter(cat => cat.items.length > 0)
        .sort((a: any, b: any) => {
            if (a.category_id === UNCAT_MENU_CATEGORY_ID) return 1;
            if (b.category_id === UNCAT_MENU_CATEGORY_ID) return -1;
            if (a.display_order !== b.display_order) {
                return a.display_order - b.display_order;
            }
            return a.category_name.localeCompare(b.category_name);
        });

    if (sortedMenuCategoriesWithItems.length === 0) {
        return (
            <section className="business-menu-items px-4 mx-auto max-w-3xl mt-4 pb-20">
                <EmptyState 
                    primaryTitle={t('noProductsAvailable')}
                    textColor="text-gray-600"
                    backgroundColor="bg-gray-50"
                    borderColor="border-gray-200"
                />
            </section>
        );
    }

    // Now, pass the processed data to the Client Component
    return (
        <section>
            <ProductsPageClientContent
                // Pass only the data relevant to the ProductsPageClientContent
                businessMenuItems={sortedMenuCategoriesWithItems}
                // We'll address how to pass theme/global data from layout in the next step (BusinessProfileClientWrapper)
                // For now, let's assume it still comes from context *within* ProductsPageClientContent if absolutely necessary,
                // but the goal is to pass it as props for clarity.
                // We will adjust ProductsPageClientContent.jsx in the next step.
            />
        </section>
    );
}