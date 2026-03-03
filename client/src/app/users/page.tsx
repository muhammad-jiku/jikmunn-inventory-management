'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import { exportToCsv } from '@/lib/exportUtils';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  User,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import {
  Download,
  EditIcon,
  PlusCircleIcon,
  Trash2Icon,
  Users as UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../(components)/EmptyState';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import UserFormModal from '../(components)/Modal/UserFormModal';
import { TableSkeleton } from '../(components)/Skeleton';

const Users = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data: usersResponse, isError, isLoading } = useGetUsersQuery();
  const users = usersResponse?.data;

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
  }) => {
    try {
      await createUser(formData).unwrap();
      toastSuccess('User created successfully');
    } catch (err) {
      toastError(err, 'Failed to create user');
    }
  };

  const handleUpdateUser = async (formData: {
    name: string;
    email: string;
  }) => {
    if (!editingUser) return;
    try {
      await updateUser({ id: editingUser.userId, ...formData }).unwrap();
      toastSuccess('User updated successfully');
    } catch (err) {
      toastError(err, 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.userId).unwrap();
      toastSuccess('User deleted');
    } catch (err) {
      toastError(err, 'Failed to delete user');
    }
    setDeletingUser(null);
  };

  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
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
          onClick={() => setEditingUser(params.row as User)}
        />,
        <GridActionsCellItem
          key='delete'
          icon={<Trash2Icon className='w-4 h-4 text-red-500' />}
          label='Delete'
          onClick={() => setDeletingUser(params.row as User)}
        />,
      ],
    },
  ];

  const handleExport = () => {
    if (!users?.length) return;
    exportToCsv(users as unknown as Record<string, unknown>[], 'users', [
      { key: 'userId', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
    ]);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col'>
        <Header name='Users' />
        <div className='mt-5'>
          <TableSkeleton rows={6} cols={4} />
        </div>
      </div>
    );
  }

  if (isError || !usersResponse) {
    return (
      <div className='text-center text-red-500 py-4'>Failed to fetch users</div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center'>
        <Header name='Users' />
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
            <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> Add User
          </button>
        </div>
      </div>
      {users && users.length > 0 ? (
        <div className='mt-5'>
          <DataGrid
            rows={users ?? []}
            columns={columns}
            getRowId={(row) => row.userId}
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
          icon={UsersIcon}
          title='No users found'
          description='Add users to manage access and permissions.'
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm'
            >
              <PlusCircleIcon className='w-4 h-4' /> Add User
            </button>
          }
        />
      )}

      {/* CREATE MODAL */}
      <UserFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* EDIT MODAL */}
      {editingUser && (
        <UserFormModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          user={editingUser}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        title='Delete User'
        message={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmLabel='Delete'
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
        isDestructive
      />
    </div>
  );
};

export default Users;
