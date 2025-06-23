'use client';

import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import React, { useEffect } from 'react';
import StoreProvider, { useAppSelector } from './redux';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Simplified and more reliable dark mode toggle logic
  useEffect(() => {
    const htmlElement = document.documentElement;

    if (isDarkMode) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
    }

    // Clean up function is not needed since we're managing the state properly
  }, [isDarkMode]);

  return (
    // Removed the manual dark/light class from here since we're applying it to html element
    // The bg-background and text-foreground will automatically respond to the dark class on html
    <div className='flex bg-background text-foreground w-full min-h-screen transition-colors duration-200'>
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-background transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
