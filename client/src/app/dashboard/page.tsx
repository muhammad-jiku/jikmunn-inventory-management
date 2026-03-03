'use client';

import {
  useGetKpiMetricsQuery,
  useGetLowStockProductsQuery,
  useSendLowStockEmailAlertMutation,
} from '@/state/api';
import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Mail,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import CardExpenseSummary from '../(components)/Dashboard/CardExpenseSummary';
import CardPopularProducts from '../(components)/Dashboard/CardPopularProducts';
import CardPurchaseSummary from '../(components)/Dashboard/CardPurchaseSummary';
import CardSalesSummary from '../(components)/Dashboard/CardSalesSummary';
import StatCard from '../(components)/Dashboard/StatCard';

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(2)}`;
};

const Dashboard = () => {
  const { data: kpi, isLoading: kpiLoading } = useGetKpiMetricsQuery(
    undefined,
    { pollingInterval: 60000 }
  );
  const { data: lowStock } = useGetLowStockProductsQuery(undefined, {
    pollingInterval: 60000,
  });
  const [sendAlert, { isLoading: isSending }] =
    useSendLowStockEmailAlertMutation();
  const [alertEmail, setAlertEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSendAlert = async () => {
    if (!alertEmail) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      const result = await sendAlert({ email: alertEmail }).unwrap();
      toast.success(result.message);
      if (result.previewUrl) {
        toast.info(`Preview: ${result.previewUrl}`, { duration: 10000 });
      }
      setShowEmailInput(false);
      setAlertEmail('');
    } catch {
      toast.error('Failed to send low stock email alert');
    }
  };

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateRange = `${thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-4 xl:grid-rows-[auto_auto_auto] xl:auto-rows-max'>
      <CardPopularProducts />
      <CardSalesSummary />
      <CardPurchaseSummary />
      <CardExpenseSummary />

      {/* Dynamic KPI StatCards */}
      <StatCard
        title='Revenue & Expenses'
        primaryIcon={<CircleDollarSign className='text-blue-600 w-6 h-6' />}
        dateRange={dateRange}
        details={[
          {
            title: 'Total Revenue',
            amount: kpiLoading ? '...' : formatCurrency(kpi?.totalRevenue ?? 0),
            changePercentage: kpi?.revenueChange ?? 0,
            IconComponent:
              (kpi?.revenueChange ?? 0) >= 0 ? TrendingUp : TrendingDown,
          },
          {
            title: 'Total Expenses',
            amount: kpiLoading
              ? '...'
              : formatCurrency(kpi?.totalExpenses ?? 0),
            changePercentage: kpi?.expenseChange ?? 0,
            IconComponent:
              (kpi?.expenseChange ?? 0) >= 0 ? TrendingUp : TrendingDown,
          },
        ]}
      />
      <StatCard
        title='Products & Users'
        primaryIcon={<Package className='text-blue-600 w-6 h-6' />}
        dateRange={dateRange}
        details={[
          {
            title: 'Total Products',
            amount: kpiLoading ? '...' : String(kpi?.totalProducts ?? 0),
            changePercentage: 0,
            IconComponent: BarChart3,
          },
          {
            title: 'Total Users',
            amount: kpiLoading ? '...' : String(kpi?.totalUsers ?? 0),
            changePercentage: 0,
            IconComponent: Users,
          },
        ]}
      />
      <StatCard
        title='Sales & Stock'
        primaryIcon={<ShoppingCart className='text-blue-600 w-6 h-6' />}
        dateRange={dateRange}
        details={[
          {
            title: 'Total Sales',
            amount: kpiLoading ? '...' : String(kpi?.totalSalesCount ?? 0),
            changePercentage: kpi?.revenueChange ?? 0,
            IconComponent:
              (kpi?.revenueChange ?? 0) >= 0 ? TrendingUp : TrendingDown,
          },
          {
            title: 'Low Stock Items',
            amount: kpiLoading ? '...' : String(kpi?.lowStockCount ?? 0),
            changePercentage: 0,
            IconComponent: AlertTriangle,
          },
        ]}
      />

      {/* Low Stock Alert Widget */}
      {lowStock && lowStock.length > 0 && (
        <div className='col-span-1 md:col-span-2 xl:col-span-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl shadow-md p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <AlertTriangle className='w-5 h-5 text-amber-600 dark:text-amber-400' />
            <h3 className='font-semibold text-amber-800 dark:text-amber-300'>
              Low Stock Alerts ({lowStock.length})
            </h3>
            <div className='ml-auto flex items-center gap-2'>
              {showEmailInput ? (
                <>
                  <input
                    type='email'
                    placeholder='recipient@email.com'
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className='px-2 py-1 text-sm rounded border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-52'
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAlert()}
                  />
                  <button
                    onClick={handleSendAlert}
                    disabled={isSending}
                    className='flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors'
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailInput(false);
                      setAlertEmail('');
                    }}
                    className='text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowEmailInput(true)}
                  className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors'
                >
                  <Mail className='w-3.5 h-3.5' /> Email Alert
                </button>
              )}
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
            {lowStock.slice(0, 8).map((item) => (
              <div
                key={item.productId}
                className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-amber-100 dark:border-gray-700'
              >
                <div className='min-w-0'>
                  <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                    {item.name}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Threshold: {item.stockThreshold}
                  </p>
                </div>
                <span className='text-sm font-bold text-red-600 dark:text-red-400 ml-2 flex-shrink-0'>
                  {item.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
          {lowStock.length > 8 && (
            <Link
              href='/inventory'
              className='inline-block mt-3 text-sm text-amber-700 dark:text-amber-400 hover:underline'
            >
              View all {lowStock.length} low stock items →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
