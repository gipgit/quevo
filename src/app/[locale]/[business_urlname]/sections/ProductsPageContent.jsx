// src/app/[locale]/(main)/[business_urlname]/sections/ProductsPageContent.jsx

"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import MenuCategoryAccordion from '@/components/MenuCategoryAccordion';
import { useTranslations } from 'next-intl'; // Import useTranslations

export default function ProductsPageContent() {
    const businessProfile = useBusinessProfile();

    const {
        businessData,
        businessSettings,
        businessMenuItems,
        activeSection,
        isDarkBackground,
        themeColorText,
        themeColorBackground,
        themeColorButton,
    } = businessProfile;

    const t = useTranslations('Common'); // Initialize translator for 'Common' namespace

    if (!businessData || !businessSettings || !businessMenuItems) {
        return <div className="text-center py-8" style={{ color: businessProfile?.themeColorText || 'black' }}>{t('loadingProducts')}</div>;
    }

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
        if (activeSection !== 'products' || !businessMenuItems.length) return;

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
    }, [businessMenuItems, activeCategory, activeSection]);

    return (
        <>
            {activeSection === 'products' && businessMenuItems.length > 0 && (
                <section id="category-pills-section" className="category-pills-section sticky top-0 z-20 w-full shadow-sm" style={{ background: 'var(--theme-color-background)' }}>
                    <div
                        className="category-pills-wrapper w-full"
                        style={{ background: 'var(--category-pills-wrapper-background)' }}
                    >
                        <div
                            className="pills-darken-overlay w-full py-4"
                            style={{ background: 'rgba(0,0,0,0.05)' }}
                        >
                            <div
                                className="flex space-x-2 px-4 overflow-x-auto scrollbar-hide container mx-auto max-w-3xl"
                            >
                                {businessMenuItems.map(category => (
                                    <button
                                        key={category.category_id}
                                        className={`category-pill flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-200 mr-2
                                            ${activeCategory === category.category_id ? 'active' : ''}`}
                                        onClick={() => scrollToCategory(category.category_id)}
                                        style={{
                                            borderColor: 'var(--category-pill-border-color)',
                                            color: activeCategory === category.category_id ? themeColorButton : themeColorText,
                                            backgroundColor: activeCategory === category.category_id ? 'var(--section-active-border-color)' : 'transparent',
                                        }}
                                    >
                                        {category.category_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="business-menu-items px-4 mx-auto max-w-3xl mt-4 pb-20">
                {activeSection === 'products' && businessMenuItems.length > 0 ? (
                    businessMenuItems.map(category => (
                        <div
                            key={category.category_id}
                            id={`category-${category.category_id}`}
                            ref={el => (categoryRefs.current[category.category_id] = el)}
                        >
                            <MenuCategoryAccordion
                                category={category}
                                menuItems={category.items}
                                themeColorText={themeColorText}
                                isDarkBackground={isDarkBackground}
                                themeColorBackground={themeColorBackground}
                                themeColorButton={themeColorButton}
                            />
                        </div>
                    ))
                ) : activeSection === 'products' ? (
                    <p className="text-center text-sm mt-10" style={{ color: themeColorText }}>{t('noProductsAvailable')}</p>
                ) : null}
            </section>
        </>
    );
}