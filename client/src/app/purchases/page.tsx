'use client';

import {
  Purchase,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import PurchaseFormModal from '../(components)/Modal/PurchaseFormModal';

const Purchases = () => {
  const {
    data: purchasesResponse,
    isLoading,
    isError,
  } = useGetPurchasesQuery();
  const purchases = useMemo(
    () => purchasesResponse?.data ?? [],
    [purchasesResponse]
  );

  const [createPurchase] = useCreatePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();
  const [deletePurchase] = useDeletePurchaseMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(
    null
  );

  const handleCreate = async (formData: {
    productId: string;
    quantity: number;
    unitCost: number;
    timestamp: string;
  }) => {
    await createPurchase(formData);
  };

  const handleUpdate = async (formData: {
    productId: string;
    quantity: number;
    unitCost: number;
    timestamp: string;
  }) => {
    if (!editingPurchase) return;
    await updatePurchase({ id: editingPurchase.purchaseId, ...formData });
  };

  const handleDelete = async () => {
    if (!deletingPurchaseId) return;
    await deletePurchase(deletingPurchaseId);
    setDeletingPurchaseId(null);
  };

  const columns: GridColDef[] = [
    { field: 'purchaseId', headerName: 'ID', width: 90 },
    {
      field: 'productName',
      headerName: 'Product',
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.product?.name ?? row.productId,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      type: 'number',
    },
    {
      field: 'unitCost',
      headerName: 'Unit Cost',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${value?.toFixed(2) ?? '0.00'}`,
    },
    {
      field: 'totalCost',
      headerName: 'Total',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${value?.toFixed(2) ?? '0.00'}`,
    },
    {
      field: 'timestamp',
      headerName: 'Date',
      width: 180,
      valueFormatter: (value: string) =>
        value ? new Date(value).toLocaleString() : '',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key='edit'
          icon={<EditIcon className='w-4 h-4' />}
          label='Edit'
          onClick={() => setEditingPurchase(params.row as Purchase)}
        />,
        <GridActionsCellItem
          key='delete'
          icon={<Trash2Icon className='w-4 h-4 text-red-500' />}
          label='Delete'
          onClick={() => setDeletingPurchaseId(params.row.purchaseId)}
        />,
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className='py-4 text-gray-900 dark:text-gray-100'>Loading...</div>
    );
  }

  if (isError || !purchasesResponse) {
    return (
      <div className='text-center text-red-500 dark:text-red-400 py-4'>
        Failed to fetch purchases
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* HEADER */}
      <div className='mb-5 flex justify-between items-center'>
        <Header name='Purchases' />
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> New Purchase
        </button>
      </div>

      {/* DATA GRID */}
      <DataGrid
        rows={purchases}
        columns={columns}
        getRowId={(row) => row.purchaseId}
        checkboxSelection
        className='bg-white dark:bg-gray-800 shadow rounded-lg border-none text-gray-700 dark:text-gray-200'
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'var(--tw-border-opacity, rgba(229,231,235,1))',
          },
          '.dark &': {
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(75,85,99,1)',
            },
          },
        }}
      />

      {/* CREATE MODAL */}
      <PurchaseFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* EDIT MODAL */}
      {editingPurchase && (
        <PurchaseFormModal
          isOpen={!!editingPurchase}
          onClose={() => setEditingPurchase(null)}
          onSubmit={handleUpdate}
          purchase={editingPurchase}
        />
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={!!deletingPurchaseId}
        title='Delete Purchase'
        message='Are you sure you want to delete this purchase? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDelete}
        onCancel={() => setDeletingPurchaseId(null)}
        isDestructive
      />
    </div>
  );
};

export default Purchases;
