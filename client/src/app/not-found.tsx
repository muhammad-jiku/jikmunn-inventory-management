'use client';

import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4'>
      <div className='text-8xl font-extrabold text-gray-200 dark:text-gray-700 select-none'>
        404
      </div>
      <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100 -mt-4'>
        Page Not Found
      </h1>
      <p className='text-gray-500 dark:text-gray-400 max-w-md'>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href='/dashboard'
        className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium'
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
