'use client';

import { UserFormValues, userFormSchema } from '@/lib/formSchemas';
import { User } from '@/state/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UserFormValues) => void;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
    });
  }, [user, reset]);

  const onFormSubmit = (data: UserFormValues) => {
    onSubmit(data);
    if (!isEdit) reset({ name: '', email: '' });
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
        <Header name={isEdit ? 'Edit User' : 'Create New User'} />
        <form onSubmit={handleSubmit(onFormSubmit)} className='mt-5'>
          <label className={labelCss}>Name</label>
          <input
            type='text'
            placeholder='Name'
            {...register('name')}
            className={inputCss}
          />
          {errors.name && <p className={errorCss}>{errors.name.message}</p>}

          <label className={labelCss}>Email</label>
          <input
            type='email'
            placeholder='Email'
            {...register('email')}
            className={inputCss}
          />
          {errors.email && <p className={errorCss}>{errors.email.message}</p>}

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

export default UserFormModal;
