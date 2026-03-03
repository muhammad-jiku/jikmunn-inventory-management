'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import { useGetProductsQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Header from '../(components)/Header';

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
  },
];

const Inventory = () => {
  const { data: productsResponse, isError, isLoading } = useGetProductsQuery();
  const products = productsResponse?.data;

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
    <div className='flex flex-col'>
      <Header name='Inventory' />
      <div className='mt-5'>
        <DataGrid
          rows={products ?? []}
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
    </div>
  );
};

export default Inventory;
