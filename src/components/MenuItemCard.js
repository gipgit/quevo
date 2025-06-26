// src/components/MenuItemCard.js
'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import MenuItemVariationDisplay from './MenuItemVariationDisplay';
import { useTranslations } from 'next-intl'; // Import useTranslations

const MenuItemCard = ({ item, themeColorTextRgb, borderColorOpacity, isDarkBackground }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tBooking = useTranslations('Booking'); // Initialize translator for 'Booking' namespace (for "fromPrice")

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const itemBorderColor = `rgba(${themeColorTextRgb}, ${borderColorOpacity})`;

    return (
        <div className="card-item rounded-lg p-4 mb-4 border" style={{ borderColor: itemBorderColor }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer" onClick={toggleAccordion}>
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:flex-grow">
                    {item.item_img && (
                        <div className="relative w-full h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 mb-4 md:mb-0 md:mr-4 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={item.item_img}
                                alt={item.item_name}
                                fill
                                className="rounded-md object-cover"
                                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 160px, (max-width: 1279px) 192px, 224px"
                                priority
                            />
                        </div>
                    )}
                    <div className="flex-grow">
                        <h4 className="font-bold text-md md:text-lg">{item.item_name}</h4>
                        {item.item_description && <p className="text-xs md:text-sm opacity-80 mt-2">{item.item_description}</p>}
                    </div>
                </div>

                <div className="flex items-center mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                    {item.menuitemvariation.length > 0 && (
                        <>
                            <span className="font-bold text-lg mr-2">
                                {item.menuitemvariation.length === 1 ?
                                    `€${parseFloat(item.menuitemvariation[0].calculated_variation_price).toFixed(2)}` :
                                    tBooking('fromPrice', { minPrice: Math.min(...item.menuitemvariation.map(v => parseFloat(v.calculated_variation_price || '0'))).toFixed(2) })
                                }
                            </span>
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </>
                    )}
                    {item.menuitemvariation.length === 0 && item.price && (
                        <span className="font-bold text-lg">€{parseFloat(item.price).toFixed(2)}</span>
                    )}
                </div>
            </div>

            {isOpen && item.menuitemvariation.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: itemBorderColor }}>
                    {item.menuitemvariation.map(variation => (
                        <MenuItemVariationDisplay
                            key={variation.variation_id}
                            variation={variation}
                            isDarkBackground={isDarkBackground}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuItemCard;