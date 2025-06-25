import {
  ExpenseByCategorySummary,
  useGetDashboardMetricsQuery,
} from '@/state/api';
import { TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

type ExpenseSums = {
  [category: string]: number;
};

const colors = ['#00C49F', '#0088FE', '#FFBB28'];

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();
  console.log('expense dashboardMetrics data', dashboardMetrics);

  const expenseSummary = dashboardMetrics?.expenseSummary[0];

  const expenseByCategorySummary =
    dashboardMetrics?.expenseByCategorySummary || [];

  const expenseSums = expenseByCategorySummary.reduce(
    (acc: ExpenseSums, item: ExpenseByCategorySummary) => {
      const category = item.category + ' Expenses';
      const amount = parseInt(item.amount, 10);
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    },
    {}
  );

  const expenseCategories = Object.entries(expenseSums).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const totalExpenses = expenseCategories.reduce(
    (acc, category: { value: number }) => acc + category.value,
    0
  );
  const formattedTotalExpenses = totalExpenses.toFixed(2);

  return (
    <div className='row-span-3 h-full xl:h-96 flex flex-col bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-200'>
      {isLoading ? (
        <div className='m-5 text-gray-900 dark:text-gray-100'>Loading...</div>
      ) : (
        <>
          {/* HEADER - Fixed height */}
          <div className='flex-shrink-0'>
            <h2 className='text-lg font-semibold mb-2 px-7 pt-5 text-gray-900 dark:text-gray-100'>
              Expense Summary
            </h2>
            <hr className='border-gray-200 dark:border-gray-600' />
          </div>

          {/* BODY - Flexible height with proper responsive layout */}
          <div className='flex-1 flex flex-col min-h-0 py-4'>
            <div className='flex flex-col xl:flex-row flex-1 min-h-0'>
              {/* CHART CONTAINER - Responsive sizing */}
              <div className='xl:basis-3/5 flex items-center justify-center relative h-[200px] xl:h-auto xl:flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      innerRadius={40}
                      outerRadius={70}
                      fill='#8884d8'
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
                  <span className='font-bold text-xl text-gray-900 dark:text-gray-100'>
                    ${formattedTotalExpenses}
                  </span>
                </div>
              </div>

              {/* LABELS CONTAINER - Responsive positioning */}
              <div className='xl:basis-2/5 flex items-center justify-center px-7 xl:px-0 xl:pr-7 mt-4 xl:mt-0'>
                <ul className='flex flex-row xl:flex-col justify-center gap-3 flex-wrap xl:flex-nowrap'>
                  {expenseCategories.map((entry, index) => (
                    <li
                      key={`legend-${index}`}
                      className='flex items-center text-xs text-gray-700 dark:text-gray-300 flex-shrink-0'
                    >
                      <span
                        className='mr-2 w-3 h-3 rounded-full flex-shrink-0'
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></span>
                      <span className='truncate whitespace-nowrap'>
                        {entry.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* FOOTER - Fixed height */}
          <div className='flex-shrink-0'>
            <hr className='border-gray-300 dark:border-gray-700' />
            {expenseSummary && (
              <div className='mt-3 flex justify-between items-center px-7 mb-4'>
                <div className='pt-2'>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    Average:{' '}
                    <span className='font-semibold text-gray-900 dark:text-gray-100'>
                      ${expenseSummary.totalExpenses.toFixed(2)}
                    </span>
                  </p>
                </div>
                <span className='flex items-center mt-2'>
                  <TrendingUp className='mr-2 text-green-500 dark:text-green-400' />
                  <span className='text-gray-900 dark:text-gray-100'>30%</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;
