'use client';

import {
  Product,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '@/state/api';
import { EditIcon, PlusCircleIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import CreateProduct from '../(components)/Modal/CreateProduct';
import EditProduct from '../(components)/Modal/EditProduct';
import Rating from '../(components)/Rating';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);
  const products = productsResponse?.data;

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct({ id: editingProduct.productId, ...productData });
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    await deleteProduct(deletingProduct.productId);
    setDeletingProduct(null);
  };

  if (isLoading) {
    return <div className='py-4'>Loading...</div>;
  }

  if (isError || !productsResponse) {
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className='mx-auto pb-5 w-full'>
      {/* SEARCH BAR */}
      <div className='mb-6'>
        <div className='flex items-center border-2 border-gray-200 dark:border-gray-700 rounded'>
          <SearchIcon className='w-5 h-5 text-gray-500 dark:text-gray-400 m-2' />
          <input
            className='w-full py-2 px-4 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
            placeholder='Search products...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className='flex justify-between items-center mb-6'>
        <Header name='Products' />
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200!' /> Create
          Product
        </button>
      </div>

      {/* BODY PRODUCTS LIST */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between'>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          products?.map((product) => (
            <div
              key={product.productId}
              className='border border-gray-200 dark:border-gray-700 shadow rounded-md p-4 max-w-full w-full mx-auto bg-white dark:bg-gray-800 relative group'
            >
              {/* ACTION BUTTONS */}
              <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  onClick={() => setEditingProduct(product)}
                  className='p-1.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer'
                  title='Edit product'
                >
                  <EditIcon className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setDeletingProduct(product)}
                  className='p-1.5 rounded bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer'
                  title='Delete product'
                >
                  <Trash2Icon className='w-4 h-4' />
                </button>
              </div>

              <div className='flex flex-col items-center'>
                <Image
                  src={`https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/product${
                    (product.name.charCodeAt(0) % 3) + 1
                  }.png`}
                  alt={product.name}
                  width={150}
                  height={150}
                  className='mb-3 rounded-2xl w-36 h-36'
                />
                <h3 className='text-lg text-gray-900 dark:text-gray-100 font-semibold'>
                  {product.name}
                </h3>
                <p className='text-gray-800 dark:text-gray-200'>
                  ${product.price.toFixed(2)}
                </p>
                <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  Stock: {product.stockQuantity}
                </div>
                {product.rating && (
                  <div className='flex items-center mt-2'>
                    <Rating rating={product.rating} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <CreateProduct
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      {/* EDIT MODAL */}
      {editingProduct && (
        <EditProduct
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
          product={editingProduct}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title='Delete Product'
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel='Delete'
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeletingProduct(null)}
        isDestructive
      />
    </div>
  );
};

export default Products;
