'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import { exportToCsv } from '@/lib/exportUtils';
import {
  Product,
  useGetLowStockProductsQuery,
  useGetProductsQuery,
} from '@/state/api';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { AlertTriangle, Archive, Download } from 'lucide-react';
import EmptyState from '../(components)/EmptyState';
import Header from '../(components)/Header';
import { TableSkeleton } from '../(components)/Skeleton';

const columns: GridColDef[] = [
  { field: 'productId', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Product Name', width: 200 },
  {
    field: 'price',
    headerName: 'Price',
    width: 110,
    type: 'number',
    valueGetter: (value, row) => `$${row.price}`,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 110,
    type: 'number',
    valueGetter: (value, row) => (row.rating ? row.rating : 'N/A'),
  },
  {
    field: 'stockQuantity',
    headerName: 'Stock Quantity',
    width: 150,
    type: 'number',
    renderCell: (params: GridRenderCellParams) => {
      const qty = params.value as number;
      const threshold = (params.row as Product).stockThreshold ?? 10;
      const isLow = qty <= threshold;
      return (
        <div className='flex items-center gap-1.5 h-full'>
          <span
            className={
              isLow ? 'text-red-600 dark:text-red-400 font-semibold' : ''
            }
          >
            {qty}
          </span>
          {isLow && <AlertTriangle className='w-4 h-4 text-amber-500' />}
        </div>
      );
    },
  },
];

const Inventory = () => {
  const { data: productsResponse, isError, isLoading } = useGetProductsQuery();
  const { data: lowStock } = useGetLowStockProductsQuery();
  const products = productsResponse?.data;

  const handleExport = () => {
    if (!products) return;
    exportToCsv(products as unknown as Record<string, unknown>[], 'inventory', [
      { key: 'productId', label: 'ID' },
      { key: 'name', label: 'Product Name' },
      { key: 'price', label: 'Price' },
      { key: 'rating', label: 'Rating' },
      { key: 'stockQuantity', label: 'Stock Quantity' },
    ]);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        <Header name='Inventory' />
        <div className='mt-5'>
          <TableSkeleton rows={8} cols={5} />
        </div>
      </div>
    );
  }

  if (isError || !productsResponse) {
    return (
      <div className='text-center text-red-500 py-4'>
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between'>
        <Header name='Inventory' />
        <button
          onClick={handleExport}
          className='flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
        >
          <Download className='w-4 h-4' /> Export CSV
        </button>
      </div>

      {/* Low stock alert banner */}
      {lowStock && lowStock.length > 0 && (
        <div className='mt-3 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg'>
          <AlertTriangle className='w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0' />
          <p className='text-sm text-amber-800 dark:text-amber-300'>
            <span className='font-semibold'>
              {lowStock.length} product{lowStock.length !== 1 ? 's' : ''}
            </span>{' '}
            below stock threshold — review and reorder soon.
          </p>
        </div>
      )}

      {products && products.length > 0 ? (
        <div className='mt-5'>
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row.productId}
            checkboxSelection
            disableColumnMenu
            hideFooterSelectedRowCount
            disableColumnResize
            disableColumnSelector
            autoHeight
            className={dataGridClassName}
            sx={dataGridDarkModeSx}
          />
        </div>
      ) : (
        <EmptyState
          icon={Archive}
          title='No inventory items'
          description='Products will appear here once created.'
        />
      )}
    </div>
  );
};

export default Inventory;
