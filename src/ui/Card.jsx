import React from 'react';

export default function Card({ children, className = '', padding = true }) {
  const pad = padding === false ? '' : 'p-4 sm:p-6';
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-100/80 ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
