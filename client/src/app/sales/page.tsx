'use client';

import {
  Sale,
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useGetSalesQuery,
  useUpdateSaleMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import SaleFormModal from '../(components)/Modal/SaleFormModal';

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
    await createSale(formData);
  };

  const handleUpdate = async (formData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    timestamp: string;
  }) => {
    if (!editingSale) return;
    await updateSale({ id: editingSale.saleId, ...formData });
  };

  const handleDelete = async () => {
    if (!deletingSaleId) return;
    await deleteSale(deletingSaleId);
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

  if (isLoading) {
    return (
      <div className='py-4 text-gray-900 dark:text-gray-100'>Loading...</div>
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
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> New Sale
        </button>
      </div>

      {/* DATA GRID */}
      <DataGrid
        rows={sales}
        columns={columns}
        getRowId={(row) => row.saleId}
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
