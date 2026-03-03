'use client';

import { ProductFormValues, productFormSchema } from '@/lib/formSchemas';
import { Product } from '@/state/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type EditProductProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (formData: ProductFormValues) => void;
  product: Product;
};

const EditProduct = ({
  isOpen,
  onClose,
  onUpdate,
  product,
}: EditProductProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      rating: product.rating ?? 0,
      stockThreshold: product.stockThreshold ?? 10,
    },
  });

  useEffect(() => {
    reset({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      rating: product.rating ?? 0,
      stockThreshold: product.stockThreshold ?? 10,
    });
  }, [product, reset]);

  const onFormSubmit = (data: ProductFormValues) => {
    onUpdate(data);
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
        <Header name='Edit Product' />
        <form onSubmit={handleSubmit(onFormSubmit)} className='mt-5'>
          <label className={labelCss}>Product Name</label>
          <input
            type='text'
            placeholder='Name'
            {...register('name')}
            className={inputCss}
          />
          {errors.name && <p className={errorCss}>{errors.name.message}</p>}

          <label className={labelCss}>Price</label>
          <input
            type='number'
            step='0.01'
            placeholder='Price'
            {...register('price')}
            className={inputCss}
          />
          {errors.price && <p className={errorCss}>{errors.price.message}</p>}

          <label className={labelCss}>Stock Quantity</label>
          <input
            type='number'
            placeholder='Stock Quantity'
            {...register('stockQuantity')}
            className={inputCss}
          />
          {errors.stockQuantity && (
            <p className={errorCss}>{errors.stockQuantity.message}</p>
          )}

          <label className={labelCss}>Rating</label>
          <input
            type='number'
            step='0.1'
            placeholder='Rating (0-5)'
            {...register('rating')}
            className={inputCss}
          />
          {errors.rating && <p className={errorCss}>{errors.rating.message}</p>}

          <label className={labelCss}>Low Stock Threshold</label>
          <input
            type='number'
            placeholder='Low stock alert threshold'
            {...register('stockThreshold')}
            className={inputCss}
          />
          {errors.stockThreshold && (
            <p className={errorCss}>{errors.stockThreshold.message}</p>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            Save Changes
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

export default EditProduct;
