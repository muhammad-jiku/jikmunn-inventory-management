'use client';

import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import AuthGuard from './(components)/AuthGuard';
import Breadcrumbs from './(components)/Breadcrumbs';
import ErrorBoundary from './(components)/ErrorBoundary';
import StoreProvider, { useAppSelector } from './redux';

/** Pages that should NOT show the dashboard layout (sidebar, navbar) */
const PUBLIC_ROUTES = ['/login', '/register'];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

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
  }, [isDarkMode]);

  // Public routes: render without sidebar/navbar/auth guard
  if (isPublicRoute) {
    return (
      <div className='bg-background text-foreground min-h-screen transition-colors duration-200'>
        <Toaster richColors position='top-right' />
        {children}
      </div>
    );
  }

  // Protected routes: sidebar + navbar + auth guard
  return (
    <div className='flex bg-background text-foreground w-full min-h-screen transition-colors duration-200'>
      <Toaster richColors position='top-right' />
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-background transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'
        }`}
      >
        <Navbar />
        <Breadcrumbs />
        <ErrorBoundary>
          <AuthGuard>{children}</AuthGuard>
        </ErrorBoundary>
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
