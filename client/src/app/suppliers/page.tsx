'use client';

import {
  Supplier,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
} from '@/state/api';
import {
  EditIcon,
  PlusCircleIcon,
  SearchIcon,
  Trash2Icon,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
    null
  );

  const {
    data: suppliersData,
    isLoading,
    isError,
  } = useGetSuppliersQuery(searchTerm ? { search: searchTerm } : undefined);
  const suppliers = suppliersData?.data ?? [];

  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    notes: '',
  });

  const resetForm = () =>
    setForm({ name: '', contact: '', email: '', address: '', notes: '' });

  const handleCreate = async () => {
    if (!form.name) return;
    await createSupplier(form);
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingSupplier) return;
    await updateSupplier({ id: editingSupplier.supplierId, ...form });
    setEditingSupplier(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    await deleteSupplier(deletingSupplier.supplierId);
    setDeletingSupplier(null);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      contact: s.contact ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      notes: s.notes ?? '',
    });
  };

  if (isLoading) return <div className='py-4 text-center'>Loading...</div>;
  if (isError)
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to load suppliers
      </div>
    );

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Suppliers' />

      {/* Search & Add */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='relative flex-grow'>
          <SearchIcon className='absolute left-3 top-3 text-gray-400 w-5 h-5' />
          <input
            className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='Search suppliers...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <PlusCircleIcon className='w-5 h-5' /> Add Supplier
        </button>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white dark:bg-gray-800 rounded-lg shadow'>
          <thead>
            <tr className='bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-left text-sm'>
              <th className='p-4'>Name</th>
              <th className='p-4'>Contact</th>
              <th className='p-4'>Email</th>
              <th className='p-4'>Address</th>
              <th className='p-4'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className='p-8 text-center text-gray-500'>
                  <Truck className='mx-auto w-12 h-12 mb-2 text-gray-300' />
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr
                  key={s.supplierId}
                  className='border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                >
                  <td className='p-4 font-medium text-gray-900 dark:text-gray-100'>
                    {s.name}
                  </td>
                  <td className='p-4 text-gray-600 dark:text-gray-300'>
                    {s.contact ?? '—'}
                  </td>
                  <td className='p-4 text-gray-600 dark:text-gray-300'>
                    {s.email ?? '—'}
                  </td>
                  <td className='p-4 text-gray-600 dark:text-gray-300'>
                    {s.address ?? '—'}
                  </td>
                  <td className='p-4 flex gap-2'>
                    <button
                      onClick={() => openEdit(s)}
                      className='text-blue-500 hover:text-blue-700'
                    >
                      <EditIcon className='w-5 h-5' />
                    </button>
                    <button
                      onClick={() => setDeletingSupplier(s)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <Trash2Icon className='w-5 h-5' />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(isCreateOpen || editingSupplier) && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
              {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
            </h2>
            {(['name', 'contact', 'email', 'address', 'notes'] as const).map(
              (field) => (
                <div key={field} className='mb-3'>
                  <label className='block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300'>
                    {field}
                  </label>
                  {field === 'notes' || field === 'address' ? (
                    <textarea
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                      rows={2}
                    />
                  ) : (
                    <input
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  )}
                </div>
              )
            )}
            <div className='flex gap-3 justify-end mt-4'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                onClick={editingSupplier ? handleUpdate : handleCreate}
              >
                {editingSupplier ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingSupplier && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4'>
            <h3 className='text-lg font-bold mb-2 text-gray-900 dark:text-gray-100'>
              Delete Supplier
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-4'>
              Are you sure you want to delete{' '}
              <strong>{deletingSupplier.name}</strong>?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300'
                onClick={() => setDeletingSupplier(null)}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
