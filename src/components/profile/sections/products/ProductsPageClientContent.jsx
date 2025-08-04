// src/components/profile/sections/ProductsPageClientContent.jsx

"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext'; // Keep for now to get global theme/business data
import MenuCategoryAccordion from '@/components/profile/sections/products/MenuCategoryAccordion';
import { useTranslations } from 'next-intl';

// IMPORTANT: This component now receives businessMenuItems as a prop.
// Other global data (businessData, businessSettings, theme colors) are still pulled from context for now.
// In a later step, we can refine this to pass them as props from BusinessProfileClientWrapper if desired.
export default function ProductsPageClientContent({ businessMenuItems }) {
    const businessProfile = useBusinessProfile(); // Still using context for global profile data
    const t = useTranslations('Common');

    // Destructure properties from businessProfile context
    const {
        businessSettings, // Global settings, from layout
        themeColorText,   // Theme data, from layout
        themeColorBackground, // Theme data, from layout
        themeColorBackgroundCard, // Theme data, from layout
        themeColorButton, // Theme data, from layout
        themeColorBorder, // Theme data, from layout
    } = businessProfile;

    // We no longer need 'activeSection' check here, as this component only renders if 'products' is the active route.
    // The previous 'if (!businessData || !businessSettings || !businessMenuItems)' check is mostly handled by the parent
    // server component now. However, `businessMenuItems` can be empty, so handle that.



    const [activeCategory, setActiveCategory] = React.useState(null);
    const categoryRefs = useRef({});
    const isProgrammaticScroll = useRef(false);

    const scrollToCategory = useCallback((categoryId) => {
        if (categoryRefs.current[categoryId]) {
            isProgrammaticScroll.current = true;
            setActiveCategory(categoryId);

            const topBarHeight = document.getElementById('topbar-club')?.offsetHeight || 0;
            const categoryPillsHeight = document.getElementById('category-pills-section')?.offsetHeight || 0;

            const extraPadding = 5;
            const offset = categoryPillsHeight + extraPadding;

            window.scrollTo({
                top: (categoryRefs.current[categoryId]?.offsetTop || 0) - offset,
                behavior: 'smooth'
            });

            setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 700);
        }
    }, []);

    useEffect(() => {
        // No need for activeSection check here anymore
        if (!businessMenuItems.length) return;

        const topBarHeight = document.getElementById('topbar-club')?.offsetHeight || 0;
        const pillsHeight = document.getElementById('category-pills-section')?.offsetHeight || 0;

        const activeZoneTop = topBarHeight + pillsHeight;

        const rootMarginValue = `-${activeZoneTop + 5}px 0px 0px 0px`;

        let scrollTimeout;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isProgrammaticScroll.current) {
                    return;
                }

                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }

                scrollTimeout = setTimeout(() => {
                    let newActiveCategoryId = null;
                    let minDistanceFromActiveZoneTop = Infinity;

                    const currentScrollY = window.scrollY;

                    for (const entry of entries) {
                        const categoryId = parseInt(entry.target.id.replace('category-', ''));

                        if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
                            continue;
                        }

                        const rect = entry.boundingClientRect;

                        const distanceFromActiveZone = Math.abs(rect.top - activeZoneTop);

                        if (rect.top <= activeZoneTop + 20) {
                            if (distanceFromActiveZone < minDistanceFromActiveZoneTop) {
                                minDistanceFromActiveZoneTop = distanceFromActiveZone;
                                newActiveCategoryId = categoryId;
                            }
                        }
                    }

                    if (newActiveCategoryId === null && businessMenuItems.length > 0 && currentScrollY < (activeZoneTop + 100)) {
                        newActiveCategoryId = businessMenuItems[0].category_id;
                    }

                    if (newActiveCategoryId !== null && newActiveCategoryId !== activeCategory) {
                        setActiveCategory(newActiveCategoryId);
                    }

                }, 100);
            },
            {
                root: null,
                rootMargin: rootMarginValue,
                threshold: Array.from({ length: 101 }, (_, i) => i / 100),
            }
        );

        businessMenuItems.forEach(category => {
            const element = categoryRefs.current[category.category_id];
            if (element) {
                observer.observe(element);
            }
        });

        if (businessMenuItems.length > 0 && activeCategory === null) {
            setActiveCategory(businessMenuItems[0].category_id);
        }

        return () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            businessMenuItems.forEach(category => {
                const element = categoryRefs.current[category.category_id];
                if (element) {
                    observer.unobserve(element);
                }
            });
            observer.disconnect();
        };
    }, [businessMenuItems, activeCategory, businessSettings]); // Added businessSettings to deps if it affects any of the logic

    // Handle case where no products are available (now handled by parent server component primarily)
    if (!businessMenuItems || businessMenuItems.length === 0) {
        return null; // Parent server component will render the "no products" message
    }

    return (
        <>
            <section id="category-pills-section" className="category-pills-section sticky top-0 z-20 w-full shadow-sm" style={{ background: 'var(--theme-color-background)' }}>
                <div
                    className="category-pills-wrapper w-full bg-[var(--category-pills-wrapper-background)] lg:bg-transparent"
                >
                    <div
                        className="pills-darken-overlay w-full py-4"
                        style={{ background: 'rgba(0,0,0,0.05)' }}
                    >
                        <div
                            className="flex space-x-2 px-4 lg:px-8 overflow-x-auto scrollbar-hide container mx-auto max-w-3xl"
                        >
                            {businessMenuItems.map(category => (
                                <button
                                    key={category.category_id}
                                    className={`category-pill flex-shrink-0 px-3 lg:px-4 py-2 rounded-full border-[1px] text-xs lg:text-sm font-medium transition-colors duration-200 mr-2
                                        ${activeCategory === category.category_id ? 'active' : ''}`}
                                    onClick={() => scrollToCategory(category.category_id)}
                                    style={{
                                        borderWidth: activeCategory === category.category_id ? '2px' : '2px',
                                        borderColor: activeCategory === category.category_id ? themeColorButton : 'transparent',
                                        color: activeCategory === category.category_id ? themeColorText : themeColorText,
                                        backgroundColor: activeCategory === category.category_id ? 'transparent' : 'transparent',
                                    }}
                                >
                                    {category.category_name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="business-menu-items max-w-3xl mx-auto px-4 lg:px-8 mt-6 pb-20">
                {businessMenuItems.map(category => (
                    <div
                        key={category.category_id}
                        id={`category-${category.category_id}`}
                        ref={el => (categoryRefs.current[category.category_id] = el)}
                    >
                        <MenuCategoryAccordion
                            category={category}
                            menuItems={category.items}
                            themeColorText={themeColorText}
                            themeColorBackground={themeColorBackground} 
                            themeColorBackgroundCard={themeColorBackgroundCard} 
                            themeColorButton={themeColorButton}
                        />
                    </div>
                ))}
            </section>
        </>
    );
}