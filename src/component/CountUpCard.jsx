import { useState, useEffect } from 'react';

/**
 * @param {{
 *   title: string,
 *   value: number,
 *   change: number,
 *   icon: string,
 *   color: string
 * }} props
 */
export default function CountUpCard({ title, value, change, icon, color }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const isPositive = change >= 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-lg ${color}`}>
          <i className={`${icon} text-white text-lg sm:text-xl`}></i>
        </div>
        <div className={`flex items-center text-xs sm:text-sm font-medium shrink-0 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {Math.abs(change)}%
        </div>
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums truncate">{count.toLocaleString()}</p>
        <p className="text-xs sm:text-sm text-gray-600 leading-snug">{title}</p>
      </div>
    </div>
  );
}