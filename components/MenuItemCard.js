// components/MenuItemCard.js
import Image from 'next/image';
import React, { useState } from 'react';
import MenuItemVariationDisplay from './MenuItemVariationDisplay';

const MenuItemCard = ({ item, themeColorTextRgb, borderColorOpacity, isDarkBackground }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const itemBorderColor = `rgba(${themeColorTextRgb}, ${borderColorOpacity})`;

  return (
    <div className="card-item rounded-lg p-4 mb-4 border" style={{ borderColor: itemBorderColor }}>
      {/* Main content flex container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer" onClick={toggleAccordion}>

        {/* Left section: Image (full width on mobile, constrained on desktop) and Item Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:flex-grow">
          {item.item_img && (
            // Image container: full width on mobile, constrained on larger screens
            // Added mb-4 for spacing on mobile, removed mr-4 from image container itself to avoid desktop spacing issues
            // Added md:mr-4 to the image container to add spacing on medium and larger screens
            <div className="relative w-full h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 mb-4 md:mb-0 md:mr-4 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.item_img}
                alt={item.item_name}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
          {/* Item Name and Description - now it aligns with the flex flow */}
          <div className="flex-grow"> {/* flex-grow allows it to take available space */}
            <h4 className="font-bold text-lg">{item.item_name}</h4>
            {item.item_description && <p className="text-sm opacity-80 mt-1">{item.item_description}</p>}
          </div>
        </div>

        {/* Right section: Price/Variations & Accordion Arrow */}
        {/* Adjusted this div to ensure proper flex alignment and spacing */}
        <div className="flex items-center mt-4 md:mt-0 md:ml-4 flex-shrink-0"> {/* Added mt-4 for mobile spacing, md:mt-0 to remove on desktop */}
          {item.menuitemvariation.length > 0 && (
            <> {/* Fragment to group multiple elements */}
              <span className="font-bold text-lg mr-2">
                {item.menuitemvariation.length === 1 ?
                  `€${parseFloat(item.menuitemvariation[0].calculated_variation_price).toFixed(2)}` :
                  `da €${Math.min(...item.menuitemvariation.map(v => parseFloat(v.calculated_variation_price || '0'))).toFixed(2)}`
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