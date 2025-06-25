// components/MenuCategoryAccordion.js
import React, { useState } from 'react';
import MenuItemCard from './MenuItemCard'; // Assuming MenuItemCard is in the same directory

const MenuCategoryAccordion = ({ category, themeColorTextRgb, borderColorOpacity, isDarkBackground }) => {
  const [isOpen, setIsOpen] = useState(true); // Start open by default, adjust to false if preferred

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const accordionBorderColor = `rgba(${themeColorTextRgb}, ${borderColorOpacity})`;

  return (
    <div className="accordion-item my-4 overflow-hidden" style={{ borderColor: accordionBorderColor }}>
      <div
        className="accordion-header py-2 cursor-pointer flex justify-between items-center"
        onClick={toggleAccordion}
      >
        <h3 className="font-bold text-xl">{category.category_name}</h3>
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="accordion-content">
          {category.items.length > 0 ? (
            category.items.map(item => (
              <MenuItemCard
                key={item.item_id}
                item={item}
                themeColorTextRgb={themeColorTextRgb}
                borderColorOpacity={borderColorOpacity}
                isDarkBackground={isDarkBackground}
              />
            ))
          ) : (
            <p className="text-center opacity-70 p-4">Nessun articolo in questa categoria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuCategoryAccordion;