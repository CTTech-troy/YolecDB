import SessionManager from './SessionManager'; 
import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar/Sidebar.jsx'; // Make sure this import exists
import Login from './auth/auth.jsx'; // Adjust path if needed
import Home from './layouts/home';
import Event from './layouts/event';
import AdminDashboard from '../page';
import Analytics from './component/analytics/page.jsx';
import BlogManager from './component/blog/page.jsx';
import GalleryPage from './component/gallery/page.jsx';
import NewsletterPage from './component/newsletter/page.jsx';
import TestimonialsPage from './component/testimonials/page.jsx';
import EventsPage from './component/events/page.jsx';
import ContactMe from './component/ContactMe/page.jsx';
import ProtectedRoute from './ProtectedRoute';
import './global.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <SessionManager>
      <div className="flex min-h-screen">
        {!isLoginPage && <Sidebar />}
        <div className={`flex-1 ${!isLoginPage ? 'ml-0 lg:ml-64' : ''} bg-gray-50`} style={{ padding: '30px' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><BlogManager /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
            <Route path="/newsletter" element={<ProtectedRoute><NewsletterPage /></ProtectedRoute>} />
            <Route path="/testimonials" element={<ProtectedRoute><TestimonialsPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/ContactMe" element={<ProtectedRoute><ContactMe /></ProtectedRoute>} />
            <Route path="/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </SessionManager>
  );
}

export default AppContent;
