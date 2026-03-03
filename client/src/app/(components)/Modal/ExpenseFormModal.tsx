'use client';

import { ExpenseFormValues, expenseFormSchema } from '@/lib/formSchemas';
import { Expense } from '@/state/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type ExpenseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    category: string;
    amount: number;
    timestamp: string;
  }) => void;
  expense?: Expense | null;
};

const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
}: ExpenseFormModalProps) => {
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      category: expense?.category ?? '',
      amount: expense?.amount ?? 0,
      timestamp: expense?.timestamp
        ? new Date(expense.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    reset({
      category: expense?.category ?? '',
      amount: expense?.amount ?? 0,
      timestamp: expense?.timestamp
        ? new Date(expense.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    });
  }, [expense, reset]);

  const onFormSubmit = (data: ExpenseFormValues) => {
    onSubmit({
      ...data,
      timestamp: new Date(data.timestamp).toISOString(),
    });
    if (!isEdit)
      reset({
        category: '',
        amount: 0,
        timestamp: new Date().toISOString().slice(0, 16),
      });
    onClose();
  };

  if (!isOpen) return null;

  const labelCss = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCss =
    'block w-full mb-1 p-2 border-gray-500 dark:border-gray-600 border-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  const errorCss = 'text-red-500 text-xs mb-2';

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-20'>
      <div className='relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
        <Header name={isEdit ? 'Edit Expense' : 'Create New Expense'} />
        <form onSubmit={handleSubmit(onFormSubmit)} className='mt-5'>
          <label className={labelCss}>Category</label>
          <select {...register('category')} className={inputCss}>
            <option value=''>Select Category</option>
            <option value='Office'>Office</option>
            <option value='Professional'>Professional</option>
            <option value='Salaries'>Salaries</option>
          </select>
          {errors.category && (
            <p className={errorCss}>{errors.category.message}</p>
          )}

          <label className={labelCss}>Amount</label>
          <input
            type='number'
            step='0.01'
            placeholder='Amount'
            {...register('amount')}
            className={inputCss}
          />
          {errors.amount && <p className={errorCss}>{errors.amount.message}</p>}

          <label className={labelCss}>Date & Time</label>
          <input
            type='datetime-local'
            {...register('timestamp')}
            className={inputCss}
          />
          {errors.timestamp && (
            <p className={errorCss}>{errors.timestamp.message}</p>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {isEdit ? 'Save Changes' : 'Create'}
          </button>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            type='button'
            className='ml-2 px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
