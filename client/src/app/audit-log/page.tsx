'use client';

import { useGetAuditLogsQuery } from '@/state/api';
import { Activity, Filter } from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';

const ACTION_COLORS: Record<string, string> = {
  CREATE:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const AuditLogPage = () => {
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAuditLogsQuery({
    page,
    ...(entityFilter && { entity: entityFilter }),
    ...(actionFilter && { action: actionFilter }),
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  if (isLoading) return <div className='py-4 text-center'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to load audit logs
      </div>
    );

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Audit Log' />

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='flex items-center gap-2'>
          <Filter className='w-5 h-5 text-gray-400' />
          <select
            className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm'
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value=''>All Entities</option>
            {['Product', 'Supplier', 'Order', 'Warehouse', 'User'].map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <select
            className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm'
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value=''>All Actions</option>
            {['CREATE', 'UPDATE', 'DELETE'].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <Activity className='mx-auto w-12 h-12 mb-2 text-gray-300' />
          No audit log entries found
        </div>
      ) : (
        <div className='space-y-3'>
          {logs.map((log) => (
            <div
              key={log.auditLogId}
              className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center gap-3'
            >
              <span
                className={`px-2 py-1 rounded text-xs font-medium w-fit ${ACTION_COLORS[log.action] ?? 'bg-gray-100'}`}
              >
                {log.action}
              </span>
              <div className='flex-grow'>
                <span className='font-medium text-gray-900 dark:text-gray-100'>
                  {log.entity}
                </span>
                <span className='text-gray-400 mx-1'>#</span>
                <span className='text-sm text-gray-500 font-mono'>
                  {log.entityId.slice(0, 8)}
                </span>
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {log.user ? `${log.user.name} (${log.user.email})` : 'System'}
              </div>
              <div className='text-xs text-gray-400'>
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-4 mt-6'>
          <button
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50'
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className='text-sm text-gray-500'>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50'
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
