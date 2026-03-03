export default function OfflinePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
      <div className='text-6xl mb-4'>📡</div>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
        You&apos;re Offline
      </h1>
      <p className='text-gray-500 dark:text-gray-400 max-w-md'>
        It looks like you&apos;ve lost your internet connection. Please check
        your network and try again. Some cached content may still be available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className='mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
      >
        Try Again
      </button>
    </div>
  );
}
