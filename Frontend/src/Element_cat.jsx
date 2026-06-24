import React from 'react';

const Element_cat = ({ category, onClick, click }) => {
  return (
    <div 
      // Appends 'active-category-tab' if click evaluates to true
      className={`category-item-tab ${click ? 'active-category-tab' : ''}`} 
      onClick={onClick}
    >
      {category}
    </div>
    
  );
};

export default Element_cat;
