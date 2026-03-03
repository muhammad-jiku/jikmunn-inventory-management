'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  inventory: 'Inventory',
  users: 'Users',
  settings: 'Settings',
  sales: 'Sales',
  purchases: 'Purchases',
  expenses: 'Expenses',
  reports: 'Reports',
};

const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4'
    >
      <Link
        href='/dashboard'
        className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
      >
        <Home className='w-4 h-4' />
      </Link>

      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = LABEL_MAP[segment] ?? segment;

        return (
          <span key={href} className='flex items-center gap-1.5'>
            <ChevronRight className='w-3.5 h-3.5 text-gray-400 dark:text-gray-600' />
            {isLast ? (
              <span className='font-medium text-gray-700 dark:text-gray-200'>
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
