'use client';

import { useGetUsersQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Header from '../(components)/Header';

const columns: GridColDef[] = [
  { field: 'userId', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 200 },
];

const Users = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();
  console.log('users', users);

  if (isLoading) {
    return <div className='py-4'>Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className='text-center text-red-500 py-4'>Failed to fetch users</div>
    );
  }

  return (
    <div className='flex flex-col'>
      <Header name='Users' />
      <div className='mt-5'>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          checkboxSelection
          disableColumnMenu
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnSelector
          autoHeight
          className='bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 !text-gray-700 dark:!text-gray-200'
          sx={{
            // Prevent extra columns
            '& .MuiDataGrid-main': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-filler': {
              backgroundColor: 'rgb(249 250 251)', // bg-gray-50
            },
            '.dark & .MuiDataGrid-filler': {
              backgroundColor: 'rgb(55 65 81)', // bg-gray-700
            },
            // Light mode styles
            '& .MuiDataGrid-root': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-cell': {
              color: 'rgb(55 65 81)', // text-gray-700
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgb(249 250 251)', // bg-gray-50
              color: 'rgb(55 65 81)',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgb(249 250 251)',
              color: 'rgb(55 65 81)',
            },
            '& .MuiTablePagination-root': {
              color: 'rgb(55 65 81)',
            },
            // Dark mode styles
            '.dark &.MuiDataGrid-root': {
              backgroundColor: 'rgb(31 41 55)', // bg-gray-800
              color: 'rgb(229 231 235)', // text-gray-200
            },
            '.dark & .MuiDataGrid-cell': {
              color: 'rgb(229 231 235)',
              borderColor: 'rgb(75 85 99)', // border-gray-600
            },
            '.dark & .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgb(55 65 81) !important', // bg-gray-700
              color: 'rgb(229 231 235) !important',
              borderColor: 'rgb(75 85 99) !important',
            },
            '.dark & .MuiDataGrid-columnHeader': {
              color: 'rgb(229 231 235) !important',
              backgroundColor: 'rgb(55 65 81) !important',
            },
            '.dark & .MuiDataGrid-columnHeaderTitle': {
              color: 'rgb(229 231 235) !important',
            },
            '.dark & .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgb(55 65 81) !important',
              color: 'rgb(229 231 235) !important',
              borderColor: 'rgb(75 85 99)',
            },
            '.dark & .MuiTablePagination-root': {
              color: 'rgb(229 231 235) !important',
            },
            '.dark & .MuiTablePagination-selectLabel': {
              color: 'rgb(229 231 235) !important',
            },
            '.dark & .MuiTablePagination-displayedRows': {
              color: 'rgb(229 231 235) !important',
            },
            '.dark & .MuiIconButton-root': {
              color: 'rgb(229 231 235) !important',
            },
            '.dark & .MuiDataGrid-row': {
              borderColor: 'rgb(75 85 99)',
              '&:hover': {
                backgroundColor: 'rgb(55 65 81)',
              },
            },
            '.dark & .MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'rgb(55 65 81)',
            },
            '.dark & .MuiCheckbox-root': {
              color: 'rgb(229 231 235)',
            },
            '.dark & .MuiDataGrid-iconSeparator': {
              color: 'rgb(156 163 175)',
            },
            '.dark & .MuiDataGrid-menuIcon': {
              color: 'rgb(229 231 235)',
            },
            '.dark & .MuiDataGrid-sortIcon': {
              color: 'rgb(229 231 235)',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Users;
