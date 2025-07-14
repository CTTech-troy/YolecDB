import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const sidebarItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: 'ri-dashboard-line' },
  { name: 'Testimonials', href: '/testimonials', icon: 'ri-chat-quote-line' },
  { name: 'Model Manager', href: '/blog', icon: 'ri-article-line' },
  { name: 'Event Display', href: '/gallery', icon: 'ri-image-line' },
  // { name: 'Newsletter Subscribers', href: '/newsletter', icon: 'ri-mail-line' },
  { name: 'Event Manager', href: '/events', icon: 'ri-calendar-event-line' },
  { name: 'Contact Me', href: '/ContactMe', icon: 'ri-contacts-line' },
  { name: 'Logout', href: '/', icon: 'ri-logout-box-line' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const topItems = sidebarItems.slice(0, -1);
  const logoutItem = sidebarItems[sidebarItems.length - 1];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-menu-line text-xl"></i>
        </div>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h1
            className="text-2xl font-bold text-gray-800"
            style={{ fontFamily: 'var(--font-pacifico)' }}
          >
            Yolec Panel
          </h1>
        </div>

        {/* Top links */}
        <nav className="mt-8">
          {topItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : ''
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className={item.icon}></i>
                </div>
                <span className="whitespace-nowrap">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout pushed to bottom */}
        <div className="absolute bottom-0 w-full">
          <Link
            to={logoutItem.href}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer ${
                location.pathname === logoutItem.href
                  ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                  : ''
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center mr-3">
                <i className={logoutItem.icon}></i>
              </div>
              <span className="whitespace-nowrap">{logoutItem.name}</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
