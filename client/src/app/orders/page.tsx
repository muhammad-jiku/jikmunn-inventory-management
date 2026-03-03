'use client';

import {
  Order,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useGetProductsQuery,
  useUpdateOrderStatusMutation,
} from '@/state/api';
import {
  CheckCircle,
  ClipboardList,
  PlusCircleIcon,
  Trash2Icon,
  TruckIcon,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';

const STATUS_COLORS: Record<string, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  delivered:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
};

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useGetOrdersQuery(statusFilter ? { status: statusFilter } : undefined);
  const orders = ordersData?.data ?? [];

  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data ?? [];

  const [createOrder] = useCreateOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPrice: number }[]
  >([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState('');

  const addItem = () =>
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) return;
    await createOrder({ notes: notes || undefined, items: validItems });
    setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
    setNotes('');
    setIsCreateOpen(false);
  };

  const handleAdvance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (next) await updateOrderStatus({ id: order.orderId, status: next });
  };

  const handleCancel = async (order: Order) => {
    if (['delivered', 'cancelled'].includes(order.status)) return;
    await updateOrderStatus({ id: order.orderId, status: 'cancelled' });
  };

  if (isLoading) return <div className='py-4 text-center'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center text-red-500 py-4'>Failed to load orders</div>
    );

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Orders' />

      {/* Filters & Add */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <select
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value=''>All Statuses</option>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(
            (s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            )
          )}
        </select>
        <div className='flex-grow' />
        <button
          className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircleIcon className='w-5 h-5' /> New Order
        </button>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <ClipboardList className='mx-auto w-12 h-12 mb-2 text-gray-300' />
          No orders found
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {orders.map((order) => (
            <div
              key={order.orderId}
              className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm text-gray-500 dark:text-gray-400 font-mono'>
                  #{order.orderId.slice(0, 8)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}
                >
                  {order.status}
                </span>
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
                {order.items?.length ?? 0} item(s) &middot; $
                {order.items
                  ?.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
                  .toFixed(2)}
              </div>
              {order.notes && (
                <p className='text-xs text-gray-500 dark:text-gray-400 mb-2 truncate'>
                  {order.notes}
                </p>
              )}
              <div className='text-xs text-gray-400 mb-3'>
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className='flex gap-2'>
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => handleAdvance(order)}
                    className='flex items-center gap-1 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  >
                    {order.status === 'confirmed' ? (
                      <TruckIcon className='w-4 h-4' />
                    ) : (
                      <CheckCircle className='w-4 h-4' />
                    )}
                    {NEXT_STATUS[order.status]}
                  </button>
                )}
                {!['delivered', 'cancelled'].includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order)}
                    className='flex items-center gap-1 text-sm px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50'
                  >
                    <XCircle className='w-4 h-4' /> Cancel
                  </button>
                )}
                {['pending', 'cancelled'].includes(order.status) && (
                  <button
                    onClick={() => deleteOrder(order.orderId)}
                    className='text-red-500 hover:text-red-700 ml-auto'
                  >
                    <Trash2Icon className='w-5 h-5' />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
              New Order
            </h2>
            <div className='mb-3'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Notes
              </label>
              <textarea
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <h3 className='text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
              Items
            </h3>
            {items.map((item, idx) => (
              <div key={idx} className='flex gap-2 mb-2 items-end'>
                <div className='flex-grow'>
                  <select
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm'
                    value={item.productId}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].productId = e.target.value;
                      const product = products.find(
                        (p) => p.productId === e.target.value
                      );
                      if (product) updated[idx].unitPrice = product.price;
                      setItems(updated);
                    }}
                  >
                    <option value=''>Select product</option>
                    {products.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type='number'
                  className='w-20 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm'
                  placeholder='Qty'
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].quantity = Number(e.target.value);
                    setItems(updated);
                  }}
                />
                <input
                  type='number'
                  className='w-24 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm'
                  placeholder='Price'
                  min={0}
                  step={0.01}
                  value={item.unitPrice}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].unitPrice = Number(e.target.value);
                    setItems(updated);
                  }}
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className='text-red-500 hover:text-red-700'
                  >
                    <Trash2Icon className='w-4 h-4' />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addItem}
              className='text-sm text-blue-500 hover:text-blue-700 mb-4'
            >
              + Add Item
            </button>
            <div className='flex gap-3 justify-end mt-4'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
