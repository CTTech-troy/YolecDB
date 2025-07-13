import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar/sidebar';
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
import './global.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64 bg-gray-50" style={{ padding: '30px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/blog" element={<BlogManager />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/ContactMe" element={<ContactMe />} />
            <Route path="/event" element={<Event />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
