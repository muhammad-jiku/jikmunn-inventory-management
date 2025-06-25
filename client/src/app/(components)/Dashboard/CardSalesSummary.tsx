import { useGetDashboardMetricsQuery } from '@/state/api';
import { TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  console.log('sales data', data);
  const salesData = data?.salesSummary || [];

  const [timeframe, setTimeframe] = useState('weekly');

  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + curr.changePercentage! / array.length;
    }, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      })
    : 'N/A';

  if (isError) {
    return <div className='m-5'>Failed to fetch data</div>;
  }

  return (
    <div className='h-full md:h-[578px] row-span-3 xl:row-span-6 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 rounded-2xl flex flex-col border border-gray-200 dark:border-gray-700'>
      {isLoading ? (
        <div className='m-5'>Loading...</div>
      ) : (
        <>
          {/* HEADER - Fixed height */}
          <div className='flex-shrink-0'>
            <h2 className='text-lg font-semibold mb-2 px-7 pt-5'>
              Sales Summary
            </h2>
            <hr className='border-gray-200 dark:border-gray-600' />
          </div>

          {/* BODY - Flexible height with overflow management */}
          <div className='flex-1 flex flex-col min-h-0'>
            {/* BODY HEADER - Fixed height */}
            <div className='flex-shrink-0 flex justify-between items-center mb-6 px-7 mt-5'>
              <div className='text-lg font-medium'>
                <p className='text-xs text-gray-700 dark:text-gray-300'>
                  Value
                </p>
                <span className='text-2xl font-extrabold'>
                  $
                  {(totalValueSum / 1000000).toLocaleString('en', {
                    maximumFractionDigits: 2,
                  })}
                  m
                </span>
                <span className='text-green-500 text-sm ml-2'>
                  <TrendingUp className='inline w-4 h-4 mr-1' />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>
              <select
                className='shadow-sm dark:shadow-gray-700/50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded'
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value);
                }}
              >
                <option value='daily'>Daily</option>
                <option value='weekly'>Weekly</option>
                <option value='monthly'>Monthly</option>
              </select>
            </div>

            {/* CHART - Flexible height, contained within remaining space */}
            <div className='flex-1 min-h-0 px-7'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={salesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray='' vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => {
                      return `$${(value / 1000000).toFixed(0)}m`;
                    }}
                    tick={{ fontSize: 12, dx: -1 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString('en')}`,
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    }}
                  />
                  <Bar
                    dataKey='totalValue'
                    fill='#3182ce'
                    barSize={10}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FOOTER - Fixed height */}
          <div className='flex-shrink-0'>
            <hr className='border-gray-300 dark:border-gray-700' />
            <div className='flex justify-between items-center mt-6 text-sm px-7 mb-4'>
              <p>{salesData.length || 0} days</p>
              <p className='text-sm'>
                Highest Sales Date:{' '}
                <span className='font-bold'>{highestValueDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
