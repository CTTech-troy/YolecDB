import React, { useState } from 'react';

// ✅ Capitalize component name to fix "component is not a function" bugs
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center md:hidden">
      <button
        onClick={toggleMobileMenu}
        className="p-2 text-gray-500 hover:text-gray-700"
      >
        <i className="fas fa-bars text-lg"></i>
      </button>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <i className="fas fa-user text-white text-sm"></i>
        </div>
      </div>
    </header>
  );
}
