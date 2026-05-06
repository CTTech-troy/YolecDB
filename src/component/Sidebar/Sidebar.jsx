import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase.js';

const sidebarItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: 'ri-dashboard-line' },
  { name: 'Testimonials', href: '/testimonials', icon: 'ri-chat-quote-line' },
  { name: 'Model Manager', href: '/blog', icon: 'ri-article-line' },
  { name: 'Registrations', href: '/blog-registrations', icon: 'ri-user-follow-line' },
  { name: 'Event Display', href: '/gallery', icon: 'ri-image-line' },
  { name: 'Newsletter Subscribers', href: '/newsletter', icon: 'ri-mail-line' },
  { name: 'Event Manager', href: '/events', icon: 'ri-calendar-event-line' },
  { name: 'Contact Me', href: '/contactme', icon: 'ri-contacts-line' },
  { name: 'Logout', href: '/', icon: 'ri-logout-box-line' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    await signOut(auth).catch(() => {});
    localStorage.removeItem('rememberMe');
    navigate('/', { replace: true });
  };

  const topItems = sidebarItems.slice(0, -1);
  const logoutItem = sidebarItems[sidebarItems.length - 1];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] min-h-[44px] min-w-[44px] p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 touch-manipulation"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <i className={`ri-${isMobileMenuOpen ? 'close' : 'menu'}-line text-xl leading-none`} />
      </button>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/50 z-[45]"
          aria-label="Close menu overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[min(18rem,88vw)] max-w-[100vw] bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-r border-gray-100 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="shrink-0 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] border-b border-gray-100">
          <h1
            className="text-xl sm:text-2xl font-bold text-gray-800 truncate"
            style={{ fontFamily: 'var(--font-pacifico)' }}
          >
            Yolec Panel
          </h1>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain py-2 pb-28">
          {topItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block touch-manipulation"
            >
              <div
                className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-50 transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : ''
                }`}
              >
                <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <span className="text-sm sm:text-base leading-snug">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="shrink-0 absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={handleLogout} className="w-full text-left touch-manipulation">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-red-50 transition-colors">
              <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                <i className={`${logoutItem.icon} text-lg`} />
              </span>
              <span className="text-sm sm:text-base">{logoutItem.name}</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
