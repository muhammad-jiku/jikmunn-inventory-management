'use client';

import { PurchaseFormValues, purchaseFormSchema } from '@/lib/formSchemas';
import { Product, Purchase, useGetProductsQuery } from '@/state/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type PurchaseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    productId: string;
    quantity: number;
    unitCost: number;
    timestamp: string;
  }) => void;
  purchase?: Purchase;
};

const PurchaseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  purchase,
}: PurchaseFormModalProps) => {
  const { data: productsResponse } = useGetProductsQuery();
  const products = productsResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseFormSchema) as any,
    defaultValues: {
      productId: purchase?.productId ?? '',
      quantity: purchase?.quantity ?? 1,
      unitCost: purchase?.unitCost ?? 0,
      timestamp: purchase?.timestamp
        ? new Date(purchase.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (purchase) {
      reset({
        productId: purchase.productId,
        quantity: purchase.quantity,
        unitCost: purchase.unitCost,
        timestamp: new Date(purchase.timestamp).toISOString().slice(0, 16),
      });
    } else {
      reset({
        productId: '',
        quantity: 1,
        unitCost: 0,
        timestamp: new Date().toISOString().slice(0, 16),
      });
    }
  }, [purchase, isOpen, reset]);

  const onFormSubmit = (data: PurchaseFormValues) => {
    onSubmit({
      ...data,
      timestamp: data.timestamp
        ? new Date(data.timestamp).toISOString()
        : new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  const labelCss = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCss =
    'block w-full mb-1 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  const errorCss = 'text-red-500 text-xs mb-2';

  return (
    <div className='fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-20'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-900'>
        <Header name={purchase ? 'Edit Purchase' : 'Create Purchase'} />
        <form onSubmit={handleSubmit(onFormSubmit)} className='mt-5'>
          {/* PRODUCT */}
          <label className={labelCss}>Product</label>
          <select {...register('productId')} className={inputCss}>
            <option value=''>Select a product</option>
            {products.map((product: Product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className={errorCss}>{errors.productId.message}</p>
          )}

          {/* QUANTITY */}
          <label className={labelCss}>Quantity</label>
          <input
            type='number'
            min={1}
            placeholder='Quantity'
            {...register('quantity')}
            className={inputCss}
          />
          {errors.quantity && (
            <p className={errorCss}>{errors.quantity.message}</p>
          )}

          {/* UNIT COST */}
          <label className={labelCss}>Unit Cost</label>
          <input
            type='number'
            min={0}
            step='0.01'
            placeholder='Unit Cost'
            {...register('unitCost')}
            className={inputCss}
          />
          {errors.unitCost && (
            <p className={errorCss}>{errors.unitCost.message}</p>
          )}

          {/* TIMESTAMP */}
          <label className={labelCss}>Date & Time</label>
          <input
            type='datetime-local'
            {...register('timestamp')}
            className={inputCss}
          />
          {errors.timestamp && (
            <p className={errorCss}>{errors.timestamp.message}</p>
          )}

          {/* ACTIONS */}
          <div className='flex justify-end gap-2 mt-4'>
            <button
              type='button'
              onClick={() => {
                reset();
                onClose();
              }}
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {purchase ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseFormModal;
