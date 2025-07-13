import React, { useState } from 'react';
import Sidebar from '../component/Sidebar/sidebar';
import AdminDashboard from '../../page'; // Adjust the import path as necessary
export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {/* <Dashboard/> */}
    </>
  );
}
