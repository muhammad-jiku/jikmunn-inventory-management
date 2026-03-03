'use client';

import { exportToCsv } from '@/lib/exportUtils';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  Expense,
  ExpenseByCategorySummary,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpensesByCategoryQuery,
  useUpdateExpenseMutation,
} from '@/state/api';
import { CircleDollarSign, Download, PlusCircleIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import EmptyState from '../(components)/EmptyState';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import ExpenseFormModal from '../(components)/Modal/ExpenseFormModal';
import { ChartSkeleton } from '../(components)/Skeleton';

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const CATEGORY_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#A4DE6C',
  '#D0ED57',
  '#FFC658',
  '#FF6B6B',
];

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );

  const {
    data: expensesResponse,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(
    () => expensesResponse?.data ?? [],
    [expensesResponse]
  );

  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const handleCreateExpense = async (formData: {
    category: string;
    amount: number;
    timestamp: string;
  }) => {
    try {
      await createExpense(formData).unwrap();
      toastSuccess('Expense created successfully');
    } catch (err) {
      toastError(err, 'Failed to create expense');
    }
  };

  const handleUpdateExpense = async (formData: {
    category: string;
    amount: number;
    timestamp: string;
  }) => {
    if (!editingExpense) return;
    try {
      await updateExpense({
        id: editingExpense.expenseId,
        ...formData,
      }).unwrap();
      toastSuccess('Expense updated successfully');
    } catch (err) {
      toastError(err, 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpenseId) return;
    try {
      await deleteExpense(deletingExpenseId).unwrap();
      toastSuccess('Expense deleted');
    } catch (err) {
      toastError(err, 'Failed to delete expense');
    }
    setDeletingExpenseId(null);
  };

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === 'All' || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          const colorIndex = Object.keys(acc).length % CATEGORY_COLORS.length;
          acc[data.category] = {
            name: data.category,
            amount: 0,
            color: CATEGORY_COLORS[colorIndex],
          };
        }
        acc[data.category].amount += amount;
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
    selectInput:
      'mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 sm:text-sm rounded-md',
  };

  const handleExport = () => {
    if (!expenses.length) return;
    exportToCsv(expenses as unknown as Record<string, unknown>[], 'expenses', [
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount' },
      { key: 'date', label: 'Date' },
    ]);
  };

  if (isLoading) {
    return (
      <div>
        <Header name='Expenses' />
        <div className='mt-5 flex flex-col md:flex-row justify-between gap-4'>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !expensesResponse) {
    return (
      <div className='text-center text-red-500 dark:text-red-400 py-4'>
        Failed to fetch expenses
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className='mb-5 flex justify-between items-center'>
        <div>
          <Header name='Expenses' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            A visual representation of expenses over time.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleExport}
            className='flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          >
            <Download className='w-4 h-4' /> Export CSV
          </button>
          <button
            className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> Add
            Expense
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {expenses.length > 0 ? (
        <div className='mt-5 flex flex-col md:flex-row justify-between gap-4'>
          <div className='w-full md:w-1/3 bg-white dark:bg-gray-800 shadow rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
              Filter by Category and Date
            </h3>
            <div className='space-y-4'>
              {/* CATEGORY */}
              <div>
                <label htmlFor='category' className={classNames.label}>
                  Category
                </label>
                <select
                  id='category'
                  name='category'
                  className={classNames.selectInput}
                  defaultValue='All'
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option>All</option>
                  <option>Office</option>
                  <option>Professional</option>
                  <option>Salaries</option>
                </select>
              </div>
              {/* START DATE */}
              <div>
                <label htmlFor='start-date' className={classNames.label}>
                  Start Date
                </label>
                <input
                  type='date'
                  id='start-date'
                  name='start-date'
                  className={classNames.selectInput}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              {/* END DATE */}
              <div>
                <label htmlFor='end-date' className={classNames.label}>
                  End Date
                </label>
                <input
                  type='date'
                  id='end-date'
                  name='end-date'
                  className={classNames.selectInput}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* PIE CHART */}
          <div className='grow bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6'>
            <ResponsiveContainer width='100%' height={400}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx='50%'
                  cy='50%'
                  label
                  outerRadius={150}
                  fill='#8884d8'
                  dataKey='amount'
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {aggregatedData.map(
                    (entry: AggregatedDataItem, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === activeIndex
                            ? 'rgb(29, 78, 216)'
                            : entry.color
                        }
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CircleDollarSign}
          title='No expenses recorded'
          description='Track your business expenses to gain financial insights.'
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm'
            >
              <PlusCircleIcon className='w-5 h-5' /> Add Expense
            </button>
          }
        />
      )}

      {/* CREATE MODAL */}
      <ExpenseFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateExpense}
      />

      {/* EDIT MODAL */}
      {editingExpense && (
        <ExpenseFormModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleUpdateExpense}
          expense={editingExpense}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingExpenseId}
        title='Delete Expense'
        message='Are you sure you want to delete this expense? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeletingExpenseId(null)}
        isDestructive
      />
    </div>
  );
};

export default Expenses;
