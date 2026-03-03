'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import { exportToCsv } from '@/lib/exportUtils';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  Sale,
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useGetSalesQuery,
  useUpdateSaleMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import {
  Download,
  EditIcon,
  PlusCircleIcon,
  Trash2Icon,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../(components)/EmptyState';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import SaleFormModal from '../(components)/Modal/SaleFormModal';
import { TableSkeleton } from '../(components)/Skeleton';

const Sales = () => {
  const { data: salesResponse, isLoading, isError } = useGetSalesQuery();
  const sales = useMemo(() => salesResponse?.data ?? [], [salesResponse]);

  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  const handleCreate = async (formData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    timestamp: string;
  }) => {
    try {
      await createSale(formData).unwrap();
      toastSuccess('Sale recorded successfully');
    } catch (err) {
      toastError(err, 'Failed to create sale');
    }
  };

  const handleUpdate = async (formData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    timestamp: string;
  }) => {
    if (!editingSale) return;
    try {
      await updateSale({ id: editingSale.saleId, ...formData }).unwrap();
      toastSuccess('Sale updated successfully');
    } catch (err) {
      toastError(err, 'Failed to update sale');
    }
  };

  const handleDelete = async () => {
    if (!deletingSaleId) return;
    try {
      await deleteSale(deletingSaleId).unwrap();
      toastSuccess('Sale deleted');
    } catch (err) {
      toastError(err, 'Failed to delete sale');
    }
    setDeletingSaleId(null);
  };

  const columns: GridColDef[] = [
    { field: 'saleId', headerName: 'ID', width: 90 },
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
      field: 'unitPrice',
      headerName: 'Unit Price',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${value?.toFixed(2) ?? '0.00'}`,
    },
    {
      field: 'totalAmount',
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
          onClick={() => setEditingSale(params.row as Sale)}
        />,
        <GridActionsCellItem
          key='delete'
          icon={<Trash2Icon className='w-4 h-4 text-red-500' />}
          label='Delete'
          onClick={() => setDeletingSaleId(params.row.saleId)}
        />,
      ],
    },
  ];

  const handleExport = () => {
    if (!sales.length) return;
    exportToCsv(sales as unknown as Record<string, unknown>[], 'sales', [
      { key: 'saleId', label: 'ID' },
      { key: 'productId', label: 'Product ID' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unitPrice', label: 'Unit Price' },
      { key: 'totalAmount', label: 'Total' },
      { key: 'timestamp', label: 'Date' },
    ]);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        <Header name='Sales' />
        <div className='mt-5'>
          <TableSkeleton rows={6} cols={6} />
        </div>
      </div>
    );
  }

  if (isError || !salesResponse) {
    return (
      <div className='text-center text-red-500 dark:text-red-400 py-4'>
        Failed to fetch sales
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* HEADER */}
      <div className='mb-5 flex justify-between items-center'>
        <Header name='Sales' />
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
            <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> New Sale
          </button>
        </div>
      </div>

      {sales.length > 0 ? (
        <DataGrid
          rows={sales}
          columns={columns}
          getRowId={(row) => row.saleId}
          checkboxSelection
          className={dataGridClassName}
          sx={dataGridDarkModeSx}
        />
      ) : (
        <EmptyState
          icon={TrendingUp}
          title='No sales recorded'
          description='Record your first sale to start tracking revenue.'
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm'
            >
              <PlusCircleIcon className='w-4 h-4' /> New Sale
            </button>
          }
        />
      )}

      {/* CREATE MODAL */}
      <SaleFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* EDIT MODAL */}
      {editingSale && (
        <SaleFormModal
          isOpen={!!editingSale}
          onClose={() => setEditingSale(null)}
          onSubmit={handleUpdate}
          sale={editingSale}
        />
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={!!deletingSaleId}
        title='Delete Sale'
        message='Are you sure you want to delete this sale? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDelete}
        onCancel={() => setDeletingSaleId(null)}
        isDestructive
      />
    </div>
  );
};

export default Sales;
