/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Product } from '@/state/api';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Header from '../Header';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

type EditProductProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (formData: ProductFormData) => void;
  product: Product;
};

const EditProduct = ({
  isOpen,
  onClose,
  onUpdate,
  product,
}: EditProductProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
    rating: product.rating ?? 0,
  });

  useEffect(() => {
    setFormData({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      rating: product.rating ?? 0,
    });
  }, [product]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'price' || name === 'stockQuantity' || name === 'rating'
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(formData);
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
        <Header name='Edit Product' />
        <form onSubmit={handleSubmit} className='mt-5'>
          <label htmlFor='editProductName' className={labelCssStyles}>
            Product Name
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

          <label htmlFor='editProductPrice' className={labelCssStyles}>
            Price
          </label>
          <input
            type='number'
            name='price'
            placeholder='Price'
            onChange={handleChange}
            value={formData.price}
            className={inputCssStyles}
            required
          />

          <label htmlFor='editStockQuantity' className={labelCssStyles}>
            Stock Quantity
          </label>
          <input
            type='number'
            name='stockQuantity'
            placeholder='Stock Quantity'
            onChange={handleChange}
            value={formData.stockQuantity}
            className={inputCssStyles}
            required
          />

          <label htmlFor='editRating' className={labelCssStyles}>
            Rating
          </label>
          <input
            type='number'
            name='rating'
            placeholder='Rating'
            onChange={handleChange}
            value={formData.rating}
            className={inputCssStyles}
            required
          />

          <button
            type='submit'
            className='mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700'
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
