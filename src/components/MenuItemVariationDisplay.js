// components/MenuItemVariationDisplay.js
import React from 'react';

const MenuItemVariationDisplay = ({ variation, isDarkBackground }) => {
  // Use the pre-calculated price from the variation object
  const displayPrice = parseFloat(variation.calculated_variation_price || '0');

  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <h5 className="font-medium">{variation.variation_name}</h5>
        {variation.additional_description && <p className="text-xs opacity-70">{variation.additional_description}</p>}
      </div>
      <span className="font-bold">€{displayPrice.toFixed(2)}</span>
    </div>
  );
};

export default MenuItemVariationDisplay;