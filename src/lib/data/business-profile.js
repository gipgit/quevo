import prisma from '@/lib/prisma'; // Assuming you have your Prisma client configured here

export async function getBusinessProfileLeanData(businessUrlname) {
    // Search for the business by business_urlname and select necessary fields
    const business = await prisma.business.findUnique({
        where: {
            business_urlname: businessUrlname,
        },
        select: {
            business_id: true,
            business_public_uuid: true,
            business_name: true,
            business_descr: true,
            business_address: true,
            business_city: true,
            business_img_cover: true,
            business_img_profile: true,
            business_email: true,
            business_phone: true,
            // Assuming businessprofilesettings is related and has theme colors
            businessprofilesettings: {
                select: {
                    theme_color_background: true,
                    theme_color_text: true,
                    theme_color_button: true,
                },
            },
            // Add other fields you need for the header/layout
            service: {
                select: { service_id: true }, // To check if booking services exist
                take: 1, // Just need to know if any exist
            },
            businessreward: {
                select: { reward_id: true }, // To check if rewards exist
                take: 1,
            },
            promo: {
                select: { promo_id: true }, // To check if promotions exist
                take: 1,
            },
            // ... any other lean data needed for the layout
        },
    });

    if (!business) {
        return { businessData: null };
    }

    // Extract theme colors or use defaults
    const themeColorBackground = business.businessprofilesettings?.theme_color_background || '#FFFFFF';
    const themeColorText = business.businessprofilesettings?.theme_color_text || '#000000';
    const themeColorButton = business.businessprofilesettings?.theme_color_button || '#007bff';

    return {
        businessData: {
            business_id: business.business_id,
            business_public_uuid: business.business_public_uuid,
            business_urlname: businessUrlname,
            business_name: business.business_name,
            business_descr: business.business_descr,
            business_address: business.business_address,
            business_city: business.business_city,
            business_img_cover: business.business_img_cover,
            business_img_profile: business.business_img_profile,
            business_email: business.business_email,
            business_phone: business.business_phone,
            business_link_booking: business.service && business.service.length > 0, // Check if booking services exist
            business_has_rewards: business.businessreward && business.businessreward.length > 0,
            business_has_promotions: business.promo && business.promo.length > 0,
            // ... other lean data properties
        },
        themeColorBackground,
        themeColorText,
        themeColorButton,
        isDarkBackground: false, // You might want to calculate this based on themeColorBackground
    };
}


/**
 * Fetches promotions for a given business_id.
 * @param {string} businessId The UUID of the business.
 * @returns {Promise<Array<Object>>} A list of promotion objects.
 */
export async function getPromotionsData(businessId) {
    try {
        const promotions = await prisma.promo.findMany({
            where: {
                business_id: businessId,
                // Add conditions for active/valid promotions if needed, e.g.:
                // date_start: { lte: new Date() }, // Promotion has started
                // date_end: { gte: new Date() },   // Promotion has not ended
                // locked: false, // Ensure it's not a locked promo if that applies
            },
            select: {
                promo_id: true,
                promo_title: true,
                promo_text_full: true,
                promo_conditions: true,
                date_start: true,
                date_end: true,
                // If you have an image URL for promos directly in the promo table:
                // image_url: true, // Assuming this field exists based on PromotionCard.jsx
            },
            orderBy: {
                date_start: 'desc', // Or by display_order if you add one
            },
        });

        // Add a placeholder image_url if your schema doesn't have it directly
        // and you want to display something in the card.
        // In a real application, you'd manage promo images separately (e.g., S3 URLs)
        // and associate them with the promo_id.
        return promotions.map(promo => ({
            ...promo,
            image_url: promo.image_url || ``,
        }));

    } catch (error) {
        console.error(`Error fetching promotions for business ID ${businessId}:`, error);
        return [];
    }
}

/**
 * Fetches rewards for a given business_id.
 * @param {string} businessId The UUID of the business.
 * @returns {Promise<Array<Object>>} A list of reward objects.
 */
export async function getRewardsData(businessId) {
    try {
        const rewards = await prisma.businessreward.findMany({
            where: {
                business_id: businessId,
                // Add conditions for active/valid rewards if needed, e.g.:
                // reward_start_date: { lte: new Date() }, // Reward has started
                // reward_end_date: { gte: new Date() },   // Reward has not ended
                // quantity_available: { gt: 0 }, // Only show if available (optional, can be filtered on client)
            },
            select: {
                reward_id: true,
                reward_description: true,
                required_points: true,
                reward_start_date: true,
                reward_end_date: true,
                quantity_available: true,
            },
            orderBy: {
                required_points: 'asc', // Order by points required, low to high
            },
        });
        return rewards;
    } catch (error) {
        console.error(`Error fetching rewards for business ID ${businessId}:`, error);
        return [];
    }
}



/**
 * Fetches booking services and their categories for a given business_urlname.
 * @param {string} businessUrlname The business_urlname of the business.
 * @returns {Promise<{services: Array<Object>, categories: Array<Object>}>} A list of services and categories.
 */
export async function getServiceRequestServicesData(businessUrlname) {
    console.log(`[getServiceRequestServicesData] Fetching data for businessUrlname: ${businessUrlname}`);
    try {
        // First get the business_id from business_urlname
        const business = await prisma.business.findUnique({
            where: { business_urlname: businessUrlname },
            select: { business_id: true }
        });

        if (!business) {
            console.error(`[getServiceRequestServicesData] Business not found for URL: ${businessUrlname}`);
            return { services: [], categories: [] };
        }

        const businessId = business.business_id;

        const services = await prisma.service.findMany({
            where: {
                business_id: businessId,
                is_active: true, // Only fetch active services
            },
            select: {
                service_id: true,
                business_id: true, // Add business_id to the selection
                service_name: true,
                description: true,
                duration_minutes: true,
                buffer_minutes: true,
                price_base: true, // Prisma will return this as a Decimal object
                date_selection: true, 
                quotation_available: true, // Add quotation_available field
                category_id: true, // To link with categories
                serviceitem: {
                    select: {
                        service_item_id: true,
                        item_name: true,
                        item_description: true,
                        price_base: true,
                        price_type: true,
                        price_unit: true,
                        display_order: true,
                        is_active: true,
                    },
                    where: { is_active: true },
                    orderBy: { display_order: 'asc' }
                },
            },
            orderBy: {
                service_name: 'asc', // Order services alphabetically
            },
        });
        // console.log(`[getServiceRequestServicesData] Fetched services (raw from Prisma):`, services); // Optional: keep for raw check

        // Convert Decimal 'price' to a number before passing to client component
        const serializedServices = services.map(service => ({
            ...service,
            price_base: service.price_base.toNumber(), // <--- CONVERT DECIMAL TO NUMBER HERE
            serviceitem: service.serviceitem?.map(item => ({
                ...item,
                price_base: item.price_base.toNumber(), // Convert service item price to number
            })) || [],
        }));

        console.log(`[getServiceRequestServicesData] Fetched services (serialized for client):`, serializedServices);


        const categoryIds = [...new Set(serializedServices.map(s => s.category_id).filter(id => id !== null))];
        console.log(`[getServiceRequestServicesData] Deduced category IDs:`, categoryIds);

        const categories = await prisma.servicecategory.findMany({
            where: {
                business_id: businessId,
                category_id: {
                    in: categoryIds,
                },
            },
            select: {
                category_id: true,
                category_name: true,
                description: true,
            },
            orderBy: {
                category_name: 'asc',
            },
        });
        console.log(`[getServiceRequestServicesData] Fetched categories:`, categories);

        return { services: serializedServices, categories };
    } catch (error) {
        console.error(`[getServiceRequestServicesData] Error fetching service request services for business URL ${businessUrlname}:`, error);
        return { services: [], categories: [] };
    }
}

/**
 * Fetches products/menu data for a given business.
 * @param {string} businessUrlname The URL name of the business.
 * @returns {Promise<Object>} Processed menu items organized by categories.
 */
export async function getProductsData(businessUrlname) {
    try {
        // First get the business_id from business_urlname
        const business = await prisma.business.findUnique({
            where: { business_urlname: businessUrlname },
            select: { business_id: true, business_public_uuid: true }
        });

        if (!business) {
            return { businessMenuItems: [] };
        }

        // Fetch the products data
        const businessData = await prisma.business.findUnique({
            where: { business_urlname: businessUrlname },
            select: {
                business_public_uuid: true,
                product: {
                    include: { 
                        productvariation: { orderBy: { variation_name: 'asc' } }, 
                        productcategory: true 
                    },
                    orderBy: { display_order: 'asc' }
                },
                productcategory: { orderBy: { display_order: 'asc' } },
            },
        });

        if (!businessData) {
            return { businessMenuItems: [] };
        }

        // Process Menu Items (Products) - Same logic as in products/page.tsx
        const menuItemsByCategory = {};
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
                category_name: 'Uncategorized', // Will be translated in the component
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
                productvariation: item.productvariation?.map((variation) => {
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
            .sort((a, b) => {
                if (a.category_id === UNCAT_MENU_CATEGORY_ID) return 1;
                if (b.category_id === UNCAT_MENU_CATEGORY_ID) return -1;
                if (a.display_order !== b.display_order) {
                    return a.display_order - b.display_order;
                }
                return a.category_name.localeCompare(b.category_name);
            });

        return { businessMenuItems: sortedMenuCategoriesWithItems };
    } catch (error) {
        console.error('Error fetching products data:', error);
        return { businessMenuItems: [] };
    }
}
