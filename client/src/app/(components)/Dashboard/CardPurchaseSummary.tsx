import { useGetDashboardMetricsQuery } from '@/state/api';
import { TrendingDown, TrendingUp } from 'lucide-react';
import numeral from 'numeral';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  console.log('purchase dashboardMetrics data', data);

  const purchaseData = data?.purchaseSummary || [];
  const lastDataPoint = purchaseData[purchaseData.length - 1] || null;

  return (
    <div className='h-full flex flex-col row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700'>
      {isLoading ? (
        <div className='m-5'>Loading...</div>
      ) : (
        <>
          {/* HEADER - Fixed height */}
          <div className='flex-shrink-0'>
            <h2 className='text-lg font-semibold mb-2 px-7 pt-5'>
              Purchase Summary
            </h2>
            <hr className='border-gray-200 dark:border-gray-600' />
          </div>

          {/* BODY - Flexible height with proper overflow */}
          <div className='flex-1 flex flex-col min-h-0'>
            {/* BODY HEADER - Fixed height */}
            <div className='flex-shrink-0 mb-4 mt-7 px-7'>
              <p className='text-xs text-gray-700 dark:text-gray-300'>
                Purchased
              </p>
              <div className='flex items-center'>
                <p className='text-2xl font-bold'>
                  {lastDataPoint
                    ? numeral(lastDataPoint.totalPurchased).format('$0.00a')
                    : '0'}
                </p>
                {lastDataPoint && (
                  <p
                    className={`text-sm ${
                      lastDataPoint.changePercentage! >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    } flex ml-3`}
                  >
                    {lastDataPoint.changePercentage! >= 0 ? (
                      <TrendingUp className='w-5 h-5 mr-1' />
                    ) : (
                      <TrendingDown className='w-5 h-5 mr-1' />
                    )}
                    {Math.abs(lastDataPoint.changePercentage!)}%
                  </p>
                )}
              </div>
            </div>

            {/* CHART - Flexible height, contained within remaining space */}
            <div className='flex-1 min-h-0 px-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={purchaseData}
                  margin={{ top: 5, right: 5, left: -45, bottom: 5 }}
                >
                  <XAxis
                    dataKey='date'
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
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
                  <Area
                    type='linear'
                    dataKey='totalPurchased'
                    stroke='#8884d8'
                    fill='#8884d8'
                    dot={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
