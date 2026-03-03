/** Reusable animated skeleton pulse block */
const SkeletonPulse = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
  />
);

/** Skeleton for a product card (grid view) */
export const ProductCardSkeleton = () => (
  <div className='border border-gray-200 dark:border-gray-700 shadow rounded-md p-4 max-w-full w-full mx-auto bg-white dark:bg-gray-800'>
    <div className='flex flex-col items-center'>
      <SkeletonPulse className='w-36 h-36 rounded-2xl mb-3' />
      <SkeletonPulse className='h-5 w-32 mb-2' />
      <SkeletonPulse className='h-4 w-20 mb-1' />
      <SkeletonPulse className='h-4 w-16 mt-1' />
      <SkeletonPulse className='h-4 w-24 mt-2' />
    </div>
  </div>
);

/** Skeleton for product card grid */
export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between'>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Skeleton for DataGrid table rows */
export const TableSkeleton = ({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
    {/* Header */}
    <div className='flex gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-900'>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonPulse key={i} className='h-4 flex-1' />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className='flex gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-700'
      >
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonPulse key={c} className='h-4 flex-1' />
        ))}
      </div>
    ))}
  </div>
);

/** Skeleton for chart cards on dashboard */
export const ChartSkeleton = () => (
  <div className='bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5'>
    <SkeletonPulse className='h-5 w-40 mb-4' />
    <SkeletonPulse className='h-48 w-full rounded-lg' />
  </div>
);

/** Skeleton for stat card on dashboard */
export const StatCardSkeleton = () => (
  <div className='bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5'>
    <div className='flex items-center gap-3 mb-4'>
      <SkeletonPulse className='h-10 w-10 rounded-full' />
      <SkeletonPulse className='h-5 w-32' />
    </div>
    <SkeletonPulse className='h-4 w-full mb-2' />
    <SkeletonPulse className='h-4 w-3/4' />
  </div>
);

export default SkeletonPulse;
