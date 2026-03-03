'use client';

import { ReactNode } from 'react';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
};

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-30 flex items-center justify-center'>
      <div className='relative p-6 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          {title}
        </h3>
        <div className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
          {message}
        </div>
        <div className='mt-4 flex justify-end gap-2'>
          <button
            onClick={onCancel}
            type='button'
            className='px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm'
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type='button'
            className={`px-4 py-2 cursor-pointer text-white rounded text-sm ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-700'
                : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
