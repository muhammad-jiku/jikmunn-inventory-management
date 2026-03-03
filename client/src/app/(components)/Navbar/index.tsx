'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { logout } from '@/state/authSlice';
import { Bell, LogOut, Menu, Moon, Search, Settings, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import CommandPalette from '../CommandPalette';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  viewer: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const authUser = useAppSelector((state) => state.auth.user);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  // Global Ctrl+K / Cmd+K shortcut
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <>
      <div className='flex justify-between items-center w-full mb-7'>
        {/* LEFT SIDE */}
        <div className='flex justify-between items-center gap-5'>
          <button
            className='px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors'
            onClick={toggleSidebar}
          >
            <Menu className='w-4 h-4 text-gray-700 dark:text-gray-300' />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className='relative flex items-center gap-2 pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-sm text-left'
          >
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='text-gray-500 dark:text-gray-400' size={20} />
            </div>
            <span className='truncate'>Search…</span>
            <kbd className='hidden md:inline-flex ml-auto items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded text-xs font-mono'>
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className='flex justify-between items-center gap-5'>
          <div className='hidden md:flex justify-between items-center gap-5'>
            <div>
              <button
                onClick={toggleDarkMode}
                className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                {isDarkMode ? (
                  <Sun
                    className='cursor-pointer text-gray-500 dark:text-gray-400 hover:text-yellow-500'
                    size={24}
                  />
                ) : (
                  <Moon
                    className='cursor-pointer text-gray-500 hover:text-blue-500'
                    size={24}
                  />
                )}
              </button>
            </div>
            <div className='relative'>
              <Bell
                className='cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
                size={24}
              />
              <span className='absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 dark:bg-red-500 rounded-full'>
                3
              </span>
            </div>
            <hr className='w-0 h-7 border border-solid border-l border-gray-300 dark:border-gray-600 mx-3' />
            <div className='flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors'>
              <Image
                src='/images/profile.svg'
                alt='Profile'
                width={50}
                height={50}
                className='rounded-full h-full object-cover'
              />
              <div className='flex flex-col'>
                <span className='font-semibold text-gray-900 dark:text-gray-100'>
                  {authUser?.name ?? 'Guest'}
                </span>
                {authUser?.role && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${ROLE_COLORS[authUser.role] ?? ROLE_COLORS.viewer}`}
                  >
                    {authUser.role}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href='/settings'>
            <Settings
              className='cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
              size={24}
            />
          </Link>
          <button
            onClick={handleLogout}
            title='Logout'
            className='p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors'
          >
            <LogOut
              className='cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              size={20}
            />
          </button>
        </div>
      </div>

      {/* Command Palette / Global Search */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
