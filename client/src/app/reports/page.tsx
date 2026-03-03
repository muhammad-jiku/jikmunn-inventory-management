'use client';

import { exportToCsv, exportToPdf } from '@/lib/exportUtils';
import { useGetReportsQuery } from '@/state/api';
import { Download, FileText, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Header from '../(components)/Header';
import { TableSkeleton } from '../(components)/Skeleton';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value
  );

type Tab = 'pnl' | 'stock' | 'sales' | 'topProducts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pnl');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const queryParams = useMemo(() => {
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [startDate, endDate]);

  const { data: report, isLoading, isError } = useGetReportsQuery(queryParams);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pnl', label: 'Profit & Loss' },
    { key: 'stock', label: 'Stock Valuation' },
    { key: 'sales', label: 'Sales Trend' },
    { key: 'topProducts', label: 'Top Products' },
  ];

  const handleExportCsv = () => {
    if (!report) return;
    if (activeTab === 'pnl') {
      exportToCsv([report.profitAndLoss], 'profit-and-loss', [
        { key: 'totalRevenue', label: 'Total Revenue' },
        { key: 'totalCost', label: 'Total Cost' },
        { key: 'totalExpenses', label: 'Total Expenses' },
        { key: 'grossProfit', label: 'Gross Profit' },
        { key: 'netProfit', label: 'Net Profit' },
      ]);
    } else if (activeTab === 'topProducts') {
      exportToCsv(report.topSellingProducts, 'top-selling-products', [
        { key: 'name', label: 'Product Name' },
        { key: 'totalRevenue', label: 'Total Revenue' },
        { key: 'totalQuantity', label: 'Total Quantity' },
      ]);
    } else if (activeTab === 'sales') {
      exportToCsv(report.salesTrend, 'sales-trend', [
        { key: 'date', label: 'Date' },
        { key: 'amount', label: 'Amount' },
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        <Header name='Reports' />
        <div className='mt-5'>
          <TableSkeleton rows={6} cols={4} />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className='flex flex-col'>
        <Header name='Reports' />
        <div className='text-center text-red-500 py-4'>
          Failed to load reports
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col' id='print-area'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
        <Header name='Reports' />
        <div className='flex items-center gap-2'>
          <button
            onClick={handleExportCsv}
            className='flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          >
            <Download className='w-4 h-4' /> CSV
          </button>
          <button
            onClick={() => exportToPdf('Report')}
            className='flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Printer className='w-4 h-4' /> Print
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <label className='text-sm text-gray-600 dark:text-gray-400'>From</label>
        <input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100'
        />
        <label className='text-sm text-gray-600 dark:text-gray-400'>To</label>
        <input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100'
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pnl' && (
        <PnlSection data={report.profitAndLoss} summary={report.summary} />
      )}
      {activeTab === 'stock' && (
        <StockSection valuation={report.stockValuation} />
      )}
      {activeTab === 'sales' && <SalesTrendSection data={report.salesTrend} />}
      {activeTab === 'topProducts' && (
        <TopProductsSection data={report.topSellingProducts} />
      )}
    </div>
  );
};

/* ── P&L Section ── */
function PnlSection({
  data,
  summary,
}: {
  data: {
    totalRevenue: number;
    totalCost: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  summary: {
    salesCount: number;
    purchasesCount: number;
    expensesCount: number;
  };
}) {
  const rows = [
    {
      label: 'Total Revenue',
      value: data.totalRevenue,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Cost of Goods Sold',
      value: -data.totalCost,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Gross Profit',
      value: data.grossProfit,
      color:
        data.grossProfit >= 0
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Operating Expenses',
      value: -data.totalExpenses,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Net Profit',
      value: data.netProfit,
      color:
        data.netProfit >= 0
          ? 'text-green-700 dark:text-green-300'
          : 'text-red-700 dark:text-red-300',
    },
  ];

  const chartData = [
    { name: 'Revenue', value: data.totalRevenue },
    { name: 'COGS', value: data.totalCost },
    { name: 'Expenses', value: data.totalExpenses },
    { name: 'Net Profit', value: Math.max(0, data.netProfit) },
  ];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2'>
          <FileText className='w-5 h-5 text-blue-600' /> Profit & Loss Statement
        </h3>
        <table className='w-full'>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 dark:border-gray-700 ${i === 2 || i === 4 ? 'font-bold' : ''}`}
              >
                <td className='py-3 text-gray-700 dark:text-gray-300'>
                  {row.label}
                </td>
                <td className={`py-3 text-right ${row.color}`}>
                  {formatCurrency(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-3'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {summary.salesCount}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Sales</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {summary.purchasesCount}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Purchases
            </p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {summary.expensesCount}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Expenses</p>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
          Breakdown
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | undefined) =>
                formatCurrency(value ?? 0)
              }
            />
            <Bar dataKey='value' radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Stock Valuation Section ── */
function StockSection({ valuation }: { valuation: number }) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 max-w-md'>
      <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
        Total Stock Valuation
      </h3>
      <p className='text-xs text-gray-500 dark:text-gray-400 mb-4'>
        Sum of (stock quantity × unit price) for all products
      </p>
      <p className='text-4xl font-bold text-blue-600 dark:text-blue-400'>
        {formatCurrency(valuation)}
      </p>
    </div>
  );
}

/* ── Sales Trend Section ── */
function SalesTrendSection({
  data,
}: {
  data: { date: string; amount: number }[];
}) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6'>
      <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
        Sales Trend
      </h3>
      {data.length === 0 ? (
        <p className='text-gray-500 dark:text-gray-400'>
          No sales data for the selected period.
        </p>
      ) : (
        <ResponsiveContainer width='100%' height={350}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey='date'
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | undefined) => [
                formatCurrency(value ?? 0),
                'Sales',
              ]}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }
            />
            <Line
              type='monotone'
              dataKey='amount'
              stroke='#3b82f6'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Top Selling Products Section ── */
function TopProductsSection({
  data,
}: {
  data: {
    productId: string;
    name: string;
    totalRevenue: number;
    totalQuantity: number;
  }[];
}) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
          Top Selling Products
        </h3>
        {data.length === 0 ? (
          <p className='text-gray-500 dark:text-gray-400'>
            No sales data available.
          </p>
        ) : (
          <div className='space-y-3'>
            {data.map((product, index) => (
              <div
                key={product.productId}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <span className='w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold'>
                    {index + 1}
                  </span>
                  <div>
                    <p className='font-medium text-gray-900 dark:text-gray-100'>
                      {product.name}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {product.totalQuantity} units sold
                    </p>
                  </div>
                </div>
                <span className='font-semibold text-green-600 dark:text-green-400'>
                  {formatCurrency(product.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
            Revenue Share
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={data.map((p) => ({
                  name: p.name,
                  value: p.totalRevenue,
                }))}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                dataKey='value'
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) =>
                  formatCurrency(value ?? 0)
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Reports;
