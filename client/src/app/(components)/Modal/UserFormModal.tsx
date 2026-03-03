/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { User } from '@/state/api';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Header from '../Header';

type UserFormData = {
  name: string;
  email: string;
};

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UserFormData) => void;
  /** When provided, the modal is in "edit" mode */
  user?: User | null;
};

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}: UserFormModalProps) => {
  const isEdit = !!user;
  const initialFormState: UserFormData = {
    name: user?.name ?? '',
    email: user?.email ?? '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
    });
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEdit) setFormData({ name: '', email: '' });
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
        <Header name={isEdit ? 'Edit User' : 'Create New User'} />
        <form onSubmit={handleSubmit} className='mt-5'>
          <label htmlFor='userName' className={labelCssStyles}>
            Name
          </label>
          <input
            type='text'
            name='name'
            placeholder='Name'
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          <label htmlFor='userEmail' className={labelCssStyles}>
            Email
          </label>
          <input
            type='email'
            name='email'
            placeholder='Email'
            onChange={handleChange}
            value={formData.email}
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

export default UserFormModal;
