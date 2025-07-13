import React from 'react';

const Button = ({ children, onClick, color }) => {
  const defaultColor = "bg-blue-600 hover:bg-blue-700 text-white";
  const colorClass = color ? color : defaultColor;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded transition-colors ${colorClass}`}
    >
      {children}
    </button>
  );
};

export default Button;
