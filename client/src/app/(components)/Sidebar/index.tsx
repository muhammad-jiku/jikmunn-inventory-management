'use client';

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
  isCollapsed?: boolean;
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
        hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? 'bg-blue-200 text-white' : ''
        }
      }`}
      >
        <Icon className='w-6 h-6 !text-gray-700' />

        <span
          className={`${
            isCollapsed ? 'hidden' : 'block'
          } font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const year = new Date().getFullYear();

  const sidebarClassNames = `fixed flex flex-col ${'w-72 md:w-64'} bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${'px-8'}`}
      >
        <Image
          src='https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/logo.png'
          alt='jikmunn-logo'
          width={27}
          height={27}
          className='rounded w-8'
        />
        <h1 className={`${'block'} font-extrabold text-2xl`}>jikmunn STOCK</h1>

        <button className='md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100'>
          <Menu className='w-4 h-4' />
        </button>
      </div>

      {/* LINKS */}
      <div className='flex-grow mt-8'>
        <SidebarLink href='/dashboard' icon={Layout} label='Dashboard' />
        <SidebarLink href='/inventory' icon={Archive} label='Inventory' />
        <SidebarLink href='/products' icon={Clipboard} label='Products' />
        <SidebarLink href='/users' icon={User} label='Users' />
        <SidebarLink
          href='/settings'
          icon={SlidersHorizontal}
          label='Settings'
        />
        <SidebarLink
          href='/expenses'
          icon={CircleDollarSign}
          label='Expenses'
        />
      </div>

      {/* FOOTER */}
      <div className={`'block'} mb-10`}>
        <p className='text-center text-xs text-gray-500'>
          &copy; {year} jikmunn. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
