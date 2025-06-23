'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { Bell, Menu, Moon, Settings, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <div className='flex justify-between items-center w-full mb-7'>
      {/* LEFT SIDE */}
      <div className='flex justify-between items-center gap-5'>
        <button
          // Updated classes to use dark mode variants
          className='px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors'
          onClick={toggleSidebar}
        >
          <Menu className='w-4 h-4 text-gray-700 dark:text-gray-300' />
        </button>

        <div className='relative'>
          <input
            type='search'
            placeholder='Start type to search groups & products'
            // Updated input styling for dark mode
            className='pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors'
          />

          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Bell className='text-gray-500 dark:text-gray-400' size={20} />
          </div>
        </div>
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
              src='https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/profile.jpg'
              alt='Profile'
              width={50}
              height={50}
              className='rounded-full h-full object-cover'
            />
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              jikmunn
            </span>
          </div>
        </div>
        <Link href='/settings'>
          <Settings
            className='cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
            size={24}
          />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
