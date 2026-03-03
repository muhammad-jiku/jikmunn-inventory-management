/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Product, Purchase, useGetProductsQuery } from '@/state/api';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Header from '../Header';

type PurchaseFormData = {
  productId: string;
  quantity: number;
  unitCost: number;
  timestamp: string;
};

type PurchaseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PurchaseFormData) => void;
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

  const [formData, setFormData] = useState<PurchaseFormData>({
    productId: purchase?.productId ?? '',
    quantity: purchase?.quantity ?? 1,
    unitCost: purchase?.unitCost ?? 0,
    timestamp: purchase?.timestamp
      ? new Date(purchase.timestamp).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        productId: purchase.productId,
        quantity: purchase.quantity,
        unitCost: purchase.unitCost,
        timestamp: new Date(purchase.timestamp).toISOString().slice(0, 16),
      });
    } else {
      setFormData({
        productId: '',
        quantity: 1,
        unitCost: 0,
        timestamp: new Date().toISOString().slice(0, 16),
      });
    }
  }, [purchase, isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'quantity' || name === 'unitCost' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      timestamp: new Date(formData.timestamp).toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCssStyles =
    'block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div className='fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-20'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-900'>
        <Header name={purchase ? 'Edit Purchase' : 'Create Purchase'} />
        <form onSubmit={handleSubmit} className='mt-5'>
          {/* PRODUCT */}
          <label htmlFor='productId' className={labelCssStyles}>
            Product
          </label>
          <select
            name='productId'
            id='productId'
            required
            onChange={handleChange}
            value={formData.productId}
            className={inputCssStyles}
          >
            <option value=''>Select a product</option>
            {products.map((product: Product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </select>

          {/* QUANTITY */}
          <label htmlFor='quantity' className={labelCssStyles}>
            Quantity
          </label>
          <input
            type='number'
            name='quantity'
            id='quantity'
            min={1}
            required
            placeholder='Quantity'
            onChange={handleChange}
            value={formData.quantity}
            className={inputCssStyles}
          />

          {/* UNIT COST */}
          <label htmlFor='unitCost' className={labelCssStyles}>
            Unit Cost
          </label>
          <input
            type='number'
            name='unitCost'
            id='unitCost'
            min={0}
            step='0.01'
            required
            placeholder='Unit Cost'
            onChange={handleChange}
            value={formData.unitCost}
            className={inputCssStyles}
          />

          {/* TIMESTAMP */}
          <label htmlFor='timestamp' className={labelCssStyles}>
            Date & Time
          </label>
          <input
            type='datetime-local'
            name='timestamp'
            id='timestamp'
            required
            onChange={handleChange}
            value={formData.timestamp}
            className={inputCssStyles}
          />

          {/* ACTIONS */}
          <div className='flex justify-end gap-2 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'
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
