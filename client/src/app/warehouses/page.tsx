'use client';

import {
  Warehouse as WarehouseType,
  useCreateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetProductsQuery,
  useGetWarehousesQuery,
  useTransferStockMutation,
  useUpdateWarehouseMutation,
  useUpdateWarehouseStockMutation,
} from '@/state/api';
import {
  ArrowRightLeft,
  EditIcon,
  Package,
  PlusCircleIcon,
  SearchIcon,
  Trash2Icon,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';

const Warehouses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseType | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState<WarehouseType | null>(null);

  const {
    data: warehousesData,
    isLoading,
    isError,
  } = useGetWarehousesQuery(searchTerm ? { search: searchTerm } : undefined);
  const warehouses = warehousesData?.data ?? [];

  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data ?? [];

  const [createWarehouse] = useCreateWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();
  const [updateWarehouseStock] = useUpdateWarehouseStockMutation();
  const [transferStock] = useTransferStockMutation();

  const [form, setForm] = useState({ name: '', location: '', capacity: '' });
  const [stockForm, setStockForm] = useState({ productId: '', quantity: '' });
  const [transferForm, setTransferForm] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    productId: '',
    quantity: '',
  });

  const resetForm = () => setForm({ name: '', location: '', capacity: '' });

  const handleCreate = async () => {
    if (!form.name) return;
    await createWarehouse({
      name: form.name,
      location: form.location || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
    });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingWarehouse) return;
    await updateWarehouse({
      id: editingWarehouse.warehouseId,
      name: form.name,
      location: form.location || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
    });
    setEditingWarehouse(null);
    resetForm();
  };

  const handleStockUpdate = async () => {
    if (!stockOpen || !stockForm.productId) return;
    await updateWarehouseStock({
      warehouseId: stockOpen.warehouseId,
      productId: stockForm.productId,
      quantity: Number(stockForm.quantity) || 0,
    });
    setStockForm({ productId: '', quantity: '' });
  };

  const handleTransfer = async () => {
    const { fromWarehouseId, toWarehouseId, productId, quantity } =
      transferForm;
    if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) return;
    await transferStock({
      fromWarehouseId,
      toWarehouseId,
      productId,
      quantity: Number(quantity),
    });
    setTransferForm({
      fromWarehouseId: '',
      toWarehouseId: '',
      productId: '',
      quantity: '',
    });
    setTransferOpen(false);
  };

  const openEdit = (w: WarehouseType) => {
    setEditingWarehouse(w);
    setForm({
      name: w.name,
      location: w.location ?? '',
      capacity: w.capacity?.toString() ?? '',
    });
  };

  if (isLoading) return <div className='py-4 text-center'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to load warehouses
      </div>
    );

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Warehouses' />

      {/* Search & Actions */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='relative flex-grow'>
          <SearchIcon className='absolute left-3 top-3 text-gray-400 w-5 h-5' />
          <input
            className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='Search warehouses...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg'
          onClick={() => setTransferOpen(true)}
        >
          <ArrowRightLeft className='w-5 h-5' /> Transfer Stock
        </button>
        <button
          className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <PlusCircleIcon className='w-5 h-5' /> Add Warehouse
        </button>
      </div>

      {/* Warehouses Grid */}
      {warehouses.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <Warehouse className='mx-auto w-12 h-12 mb-2 text-gray-300' />
          No warehouses found
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {warehouses.map((w) => (
            <div
              key={w.warehouseId}
              className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'
            >
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <h3 className='font-bold text-gray-900 dark:text-gray-100'>
                    {w.name}
                  </h3>
                  {w.location && (
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {w.location}
                    </p>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => openEdit(w)}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    <EditIcon className='w-5 h-5' />
                  </button>
                  <button
                    onClick={() => deleteWarehouse(w.warehouseId)}
                    className='text-red-500 hover:text-red-700'
                  >
                    <Trash2Icon className='w-5 h-5' />
                  </button>
                </div>
              </div>
              {w.capacity && (
                <p className='text-xs text-gray-400 mb-2'>
                  Capacity: {w.capacity}
                </p>
              )}
              <div className='border-t border-gray-200 dark:border-gray-700 pt-2 mt-2'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Stock
                  </span>
                  <button
                    className='text-xs text-blue-500 hover:text-blue-700'
                    onClick={() => {
                      setStockOpen(w);
                      setStockForm({ productId: '', quantity: '' });
                    }}
                  >
                    <Package className='w-4 h-4 inline mr-1' />
                    Update Stock
                  </button>
                </div>
                {w.stocks && w.stocks.length > 0 ? (
                  <ul className='text-sm text-gray-600 dark:text-gray-300 space-y-1 max-h-32 overflow-y-auto'>
                    {w.stocks.map((s) => (
                      <li
                        key={s.warehouseStockId}
                        className='flex justify-between'
                      >
                        <span>
                          {s.product?.name ?? s.productId.slice(0, 8)}
                        </span>
                        <span className='font-mono'>{s.quantity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-xs text-gray-400'>No stock items</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateOpen || editingWarehouse) && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
              {editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
            </h2>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Name *
              </label>
              <input
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Location
              </label>
              <input
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Capacity
              </label>
              <input
                type='number'
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className='flex gap-3 justify-end mt-4'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingWarehouse(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                onClick={editingWarehouse ? handleUpdate : handleCreate}
              >
                {editingWarehouse ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
              Update Stock — {stockOpen.name}
            </h2>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Product
              </label>
              <select
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={stockForm.productId}
                onChange={(e) =>
                  setStockForm({ ...stockForm, productId: e.target.value })
                }
              >
                <option value=''>Select product</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Quantity
              </label>
              <input
                type='number'
                min={0}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={stockForm.quantity}
                onChange={(e) =>
                  setStockForm({ ...stockForm, quantity: e.target.value })
                }
              />
            </div>
            <div className='flex gap-3 justify-end mt-4'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'
                onClick={() => setStockOpen(null)}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                onClick={handleStockUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {transferOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
              Transfer Stock
            </h2>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                From Warehouse
              </label>
              <select
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={transferForm.fromWarehouseId}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    fromWarehouseId: e.target.value,
                  })
                }
              >
                <option value=''>Select source</option>
                {warehouses.map((w) => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                To Warehouse
              </label>
              <select
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={transferForm.toWarehouseId}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    toWarehouseId: e.target.value,
                  })
                }
              >
                <option value=''>Select destination</option>
                {warehouses
                  .filter((w) => w.warehouseId !== transferForm.fromWarehouseId)
                  .map((w) => (
                    <option key={w.warehouseId} value={w.warehouseId}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Product
              </label>
              <select
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={transferForm.productId}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    productId: e.target.value,
                  })
                }
              >
                <option value=''>Select product</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='mb-3'>
              <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                Quantity
              </label>
              <input
                type='number'
                min={1}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={transferForm.quantity}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, quantity: e.target.value })
                }
              />
            </div>
            <div className='flex gap-3 justify-end mt-4'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'
                onClick={() => setTransferOpen(false)}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600'
                onClick={handleTransfer}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
