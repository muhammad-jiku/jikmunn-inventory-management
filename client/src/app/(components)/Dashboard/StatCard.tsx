import { LucideIcon } from 'lucide-react';
import React, { JSX } from 'react';

type StatDetail = {
  title: string;
  amount: string;
  changePercentage: number;
  IconComponent: LucideIcon;
};

type StatCardProps = {
  title: string;
  primaryIcon: JSX.Element;
  details: StatDetail[];
  dateRange: string;
};

const StatCard = ({
  title,
  primaryIcon,
  details,
  dateRange,
}: StatCardProps) => {
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? '+' : '';
    return `${signal}${value.toFixed()}%`;
  };

  const getChangeColor = (value: number) =>
    value >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className='md:row-span-1 xl:row-span-2 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 col-span-1 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col'>
      {/* HEADER - Fixed height */}
      <div className='flex-shrink-0'>
        <div className='flex justify-between items-center mb-2 px-5 pt-4'>
          <h2 className='font-semibold text-lg text-gray-900 dark:text-gray-100'>
            {title}
          </h2>
          <span className='text-xs text-gray-700 dark:text-gray-300'>
            {dateRange}
          </span>
        </div>
        <hr className='border-gray-200 dark:border-gray-600' />
      </div>

      {/* BODY - Flexible height with overflow handling */}
      <div className='flex-1 flex items-center justify-around gap-4 px-5 py-6 min-h-0'>
        <div className='rounded-full p-5 bg-blue-50 border-sky-300 border-[1px] flex-shrink-0'>
          {primaryIcon}
        </div>
        <div className='flex-1 min-w-0'>
          {details.map((detail, index) => (
            <React.Fragment key={index}>
              <div className='flex items-center justify-between my-4'>
                <span className='text-gray-500 dark:text-gray-300 truncate mr-2'>
                  {detail.title}
                </span>
                <span className='font-bold text-gray-800 dark:text-gray-300 flex-shrink-0'>
                  {detail.amount}
                </span>
                <div className='flex items-center flex-shrink-0 ml-2'>
                  <detail.IconComponent
                    className={`w-4 h-4 mr-1 ${getChangeColor(
                      detail.changePercentage
                    )}`}
                  />
                  <span
                    className={`font-medium text-sm ${getChangeColor(
                      detail.changePercentage
                    )}`}
                  >
                    {formatPercentage(detail.changePercentage)}
                  </span>
                </div>
              </div>
              {index < details.length - 1 && (
                <hr className='border-gray-300 dark:border-gray-700' />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
