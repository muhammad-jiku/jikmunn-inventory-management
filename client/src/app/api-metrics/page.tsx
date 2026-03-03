'use client';

import { useGetApiMetricsQuery } from '@/state/api';
import { AlertTriangle, BarChart3, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';

const ApiMetricsPage = () => {
  const [hours, setHours] = useState(24);
  const { data: metrics, isLoading, isError } = useGetApiMetricsQuery(hours);

  if (isLoading)
    return <div className='py-4 text-center'>Loading metrics...</div>;
  if (isError)
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to load API metrics (admin only)
      </div>
    );
  if (!metrics) return null;

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='API Metrics Dashboard' />

      {/* Time Range Selector */}
      <div className='flex gap-2 mb-6'>
        {[1, 6, 12, 24, 48, 168].map((h) => (
          <button
            key={h}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              hours === h
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setHours(h)}
          >
            {h < 24 ? `${h}h` : `${h / 24}d`}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-5'>
          <div className='flex items-center gap-3'>
            <BarChart3 className='w-8 h-8 text-blue-500' />
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Requests
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {metrics.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-5'>
          <div className='flex items-center gap-3'>
            <Clock className='w-8 h-8 text-green-500' />
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Avg Latency
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {metrics.averageLatencyMs}ms
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-5'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='w-8 h-8 text-red-500' />
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Error Rate
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {metrics.errorRate}%
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-5'>
          <div className='flex items-center gap-3'>
            <Users className='w-8 h-8 text-purple-500' />
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Active Users
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {metrics.topUsers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Endpoints Table */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow mb-6'>
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
            Top Endpoints
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr className='text-left text-sm text-gray-500 dark:text-gray-400'>
                <th className='p-4'>Method</th>
                <th className='p-4'>Endpoint</th>
                <th className='p-4 text-right'>Requests</th>
                <th className='p-4 text-right'>Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topEndpoints.map((ep, idx) => (
                <tr
                  key={idx}
                  className='border-t border-gray-100 dark:border-gray-700'
                >
                  <td className='p-4'>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ep.method === 'GET'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : ep.method === 'POST'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : ep.method === 'PUT' || ep.method === 'PATCH'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className='p-4 font-mono text-sm text-gray-700 dark:text-gray-300'>
                    {ep.endpoint}
                  </td>
                  <td className='p-4 text-right text-gray-900 dark:text-gray-100'>
                    {ep.requests.toLocaleString()}
                  </td>
                  <td className='p-4 text-right text-gray-900 dark:text-gray-100'>
                    {ep.avgLatencyMs}ms
                  </td>
                </tr>
              ))}
              {metrics.topEndpoints.length === 0 && (
                <tr>
                  <td colSpan={4} className='p-8 text-center text-gray-500'>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Codes */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
              Status Codes
            </h3>
          </div>
          <div className='p-4 space-y-2'>
            {metrics.statusCodes.map((sc) => (
              <div
                key={sc.statusCode}
                className='flex items-center justify-between'
              >
                <span
                  className={`font-mono text-sm ${
                    sc.statusCode < 300
                      ? 'text-green-600'
                      : sc.statusCode < 400
                        ? 'text-blue-600'
                        : sc.statusCode < 500
                          ? 'text-yellow-600'
                          : 'text-red-600'
                  }`}
                >
                  {sc.statusCode}
                </span>
                <div className='flex-grow mx-4'>
                  <div className='h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full ${
                        sc.statusCode < 300
                          ? 'bg-green-500'
                          : sc.statusCode < 400
                            ? 'bg-blue-500'
                            : sc.statusCode < 500
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      }`}
                      style={{
                        width: `${metrics.totalRequests ? (sc.count / metrics.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className='text-sm text-gray-600 dark:text-gray-300 min-w-[4rem] text-right'>
                  {sc.count.toLocaleString()}
                </span>
              </div>
            ))}
            {metrics.statusCodes.length === 0 && (
              <p className='text-center text-gray-500 py-4'>No data</p>
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
              Top Users by Requests
            </h3>
          </div>
          <div className='p-4 space-y-2'>
            {metrics.topUsers.map((u, idx) => (
              <div key={idx} className='flex items-center justify-between'>
                <span className='text-sm font-mono text-gray-600 dark:text-gray-300 truncate max-w-[60%]'>
                  {u.userId}
                </span>
                <span className='text-sm text-gray-900 dark:text-gray-100 font-medium'>
                  {u.requests.toLocaleString()}
                </span>
              </div>
            ))}
            {metrics.topUsers.length === 0 && (
              <p className='text-center text-gray-500 py-4'>No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiMetricsPage;
