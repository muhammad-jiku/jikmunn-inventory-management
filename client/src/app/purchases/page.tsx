'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import { exportToCsv } from '@/lib/exportUtils';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  Purchase,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import {
  Download,
  EditIcon,
  PlusCircleIcon,
  ShoppingCart,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../(components)/EmptyState';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import PurchaseFormModal from '../(components)/Modal/PurchaseFormModal';
import { TableSkeleton } from '../(components)/Skeleton';

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
    try {
      await createPurchase(formData).unwrap();
      toastSuccess('Purchase recorded successfully');
    } catch (err) {
      toastError(err, 'Failed to create purchase');
    }
  };

  const handleUpdate = async (formData: {
    productId: string;
    quantity: number;
    unitCost: number;
    timestamp: string;
  }) => {
    if (!editingPurchase) return;
    try {
      await updatePurchase({
        id: editingPurchase.purchaseId,
        ...formData,
      }).unwrap();
      toastSuccess('Purchase updated successfully');
    } catch (err) {
      toastError(err, 'Failed to update purchase');
    }
  };

  const handleDelete = async () => {
    if (!deletingPurchaseId) return;
    try {
      await deletePurchase(deletingPurchaseId).unwrap();
      toastSuccess('Purchase deleted');
    } catch (err) {
      toastError(err, 'Failed to delete purchase');
    }
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

  const handleExport = () => {
    if (!purchases.length) return;
    exportToCsv(
      purchases as unknown as Record<string, unknown>[],
      'purchases',
      [
        { key: 'purchaseId', label: 'ID' },
        { key: 'productId', label: 'Product ID' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unitCost', label: 'Unit Cost' },
        { key: 'totalCost', label: 'Total' },
        { key: 'timestamp', label: 'Date' },
      ]
    );
  };

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        <Header name='Purchases' />
        <div className='mt-5'>
          <TableSkeleton rows={6} cols={6} />
        </div>
      </div>
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
        <div className='flex items-center gap-2'>
          <button
            onClick={handleExport}
            className='flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          >
            <Download className='w-4 h-4' /> Export CSV
          </button>
          <button
            className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> New
            Purchase
          </button>
        </div>
      </div>

      {purchases.length > 0 ? (
        <DataGrid
          rows={purchases}
          columns={columns}
          getRowId={(row) => row.purchaseId}
          checkboxSelection
          className={dataGridClassName}
          sx={dataGridDarkModeSx}
        />
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title='No purchases recorded'
          description='Record your first purchase to start tracking costs.'
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm'
            >
              <PlusCircleIcon className='w-4 h-4' /> New Purchase
            </button>
          }
        />
      )}

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
