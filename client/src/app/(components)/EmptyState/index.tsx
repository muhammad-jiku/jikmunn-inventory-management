import { Inbox, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className='flex flex-col items-center justify-center py-16 gap-3 text-center'>
    <div className='w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-1'>
      <Icon className='w-7 h-7 text-gray-400 dark:text-gray-500' />
    </div>
    <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300'>
      {title}
    </h3>
    {description && (
      <p className='text-sm text-gray-500 dark:text-gray-400 max-w-xs'>
        {description}
      </p>
    )}
    {action && <div className='mt-2'>{action}</div>}
  </div>
);

export default EmptyState;
