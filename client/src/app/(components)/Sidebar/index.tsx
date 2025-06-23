'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? 'justify-center py-4' : 'justify-start px-8 py-4'
        }
        hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 gap-3 transition-colors ${
          isActive
            ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300'
        }
      }`}
      >
        {/* Updated icon colors to respect dark mode and active states */}
        <Icon
          className={`w-6 h-6 ${
            isActive
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        />

        <span
          className={`${isCollapsed ? 'hidden' : 'block'} font-medium ${
            isActive
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const year = new Date().getFullYear();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  // Updated sidebar classes to include dark mode styling
  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? 'w-0 md:w-16' : 'w-72 md:w-64'
  } bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden h-full shadow-md dark:shadow-gray-800/50 z-40 border-r border-gray-200 dark:border-gray-700`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? 'px-5' : 'px-8'
        }`}
      >
        <Image
          src='https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/logo.png'
          alt='jikmunn-logo'
          width={27}
          height={27}
          className='rounded w-8'
        />
        <h1
          className={`${
            isSidebarCollapsed ? 'hidden' : 'block'
          } font-extrabold text-2xl text-gray-900 dark:text-gray-100`}
        >
          jikmunn STOCK
        </h1>

        <button
          className='md:hidden px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors'
          onClick={toggleSidebar}
        >
          <Menu className='w-4 h-4 text-gray-700 dark:text-gray-300' />
        </button>
      </div>

      {/* LINKS */}
      <div className='grow mt-8'>
        <SidebarLink
          href='/dashboard'
          icon={Layout}
          label='Dashboard'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/inventory'
          icon={Archive}
          label='Inventory'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/products'
          icon={Clipboard}
          label='Products'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/users'
          icon={User}
          label='Users'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/settings'
          icon={SlidersHorizontal}
          label='Settings'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/expenses'
          icon={CircleDollarSign}
          label='Expenses'
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} mb-10`}>
        <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
          &copy; {year} jikmunn. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
