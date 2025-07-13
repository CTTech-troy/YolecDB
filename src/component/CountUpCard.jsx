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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
        <div className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {Math.abs(change)}%
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}