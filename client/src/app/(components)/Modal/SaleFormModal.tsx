'use client';

import { SaleFormValues, saleFormSchema } from '@/lib/formSchemas';
import { Product, Sale, useGetProductsQuery } from '@/state/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type SaleFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    timestamp: string;
  }) => void;
  sale?: Sale;
};

const SaleFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  sale,
}: SaleFormModalProps) => {
  const { data: productsResponse } = useGetProductsQuery();
  const products = productsResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(saleFormSchema) as any,
    defaultValues: {
      productId: sale?.productId ?? '',
      quantity: sale?.quantity ?? 1,
      unitPrice: sale?.unitPrice ?? 0,
      timestamp: sale?.timestamp
        ? new Date(sale.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (sale) {
      reset({
        productId: sale.productId,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        timestamp: new Date(sale.timestamp).toISOString().slice(0, 16),
      });
    } else {
      reset({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        timestamp: new Date().toISOString().slice(0, 16),
      });
    }
  }, [sale, isOpen, reset]);

  const onFormSubmit = (data: SaleFormValues) => {
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
        <Header name={sale ? 'Edit Sale' : 'Create Sale'} />
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

          {/* UNIT PRICE */}
          <label className={labelCss}>Unit Price</label>
          <input
            type='number'
            min={0}
            step='0.01'
            placeholder='Unit Price'
            {...register('unitPrice')}
            className={inputCss}
          />
          {errors.unitPrice && (
            <p className={errorCss}>{errors.unitPrice.message}</p>
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
              {sale ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleFormModal;
