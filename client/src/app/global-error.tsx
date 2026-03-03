'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang='en'>
      <body className='bg-gray-50 dark:bg-gray-900'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md'>
            <div className='text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2'>
              Something went wrong
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              An unexpected error occurred. The issue has been reported
              automatically.
            </p>
            <button
              onClick={reset}
              className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium'
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
