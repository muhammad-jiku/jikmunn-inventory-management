'use client';

import { useAppSelector } from '@/app/redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Client-side auth guard that redirects unauthenticated users to /login.
 * Optionally restricts access based on roles.
 */
const AuthGuard = ({ children, requiredRoles }: AuthGuardProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-500 dark:text-gray-400'>Redirecting...</div>
      </div>
    );
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh]'>
        <h2 className='text-2xl font-bold text-red-500 mb-2'>Access Denied</h2>
        <p className='text-gray-500 dark:text-gray-400'>
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
