/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Expense } from '@/state/api';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Header from '../Header';

type ExpenseFormData = {
  category: string;
  amount: number;
  timestamp: string;
};

type ExpenseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ExpenseFormData) => void;
  expense?: Expense | null;
};

const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
}: ExpenseFormModalProps) => {
  const isEdit = !!expense;
  const initialFormState: ExpenseFormData = {
    category: expense?.category ?? '',
    amount: expense?.amount ?? 0,
    timestamp: expense?.timestamp
      ? new Date(expense.timestamp).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData({
      category: expense?.category ?? '',
      amount: expense?.amount ?? 0,
      timestamp: expense?.timestamp
        ? new Date(expense.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    });
  }, [expense]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      timestamp: new Date(formData.timestamp).toISOString(),
    });
    if (!isEdit)
      setFormData({
        category: '',
        amount: 0,
        timestamp: new Date().toISOString().slice(0, 16),
      });
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCssStyles =
    'block w-full mb-2 p-2 border-gray-500 dark:border-gray-600 border-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-20'>
      <div className='relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
        <Header name={isEdit ? 'Edit Expense' : 'Create New Expense'} />
        <form onSubmit={handleSubmit} className='mt-5'>
          <label htmlFor='category' className={labelCssStyles}>
            Category
          </label>
          <select
            name='category'
            onChange={handleChange}
            value={formData.category}
            className={inputCssStyles}
            required
          >
            <option value=''>Select Category</option>
            <option value='Office'>Office</option>
            <option value='Professional'>Professional</option>
            <option value='Salaries'>Salaries</option>
          </select>

          <label htmlFor='amount' className={labelCssStyles}>
            Amount
          </label>
          <input
            type='number'
            name='amount'
            placeholder='Amount'
            onChange={handleChange}
            value={formData.amount}
            className={inputCssStyles}
            required
            min={0}
            step='0.01'
          />

          <label htmlFor='timestamp' className={labelCssStyles}>
            Date & Time
          </label>
          <input
            type='datetime-local'
            name='timestamp'
            onChange={handleChange}
            value={formData.timestamp}
            className={inputCssStyles}
            required
          />

          <button
            type='submit'
            className='mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700'
          >
            {isEdit ? 'Save Changes' : 'Create'}
          </button>
          <button
            onClick={onClose}
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
