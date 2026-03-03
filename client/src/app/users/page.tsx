'use client';

import { dataGridClassName, dataGridDarkModeSx } from '@/lib/dataGridStyles';
import {
  User,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/state/api';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import Header from '../(components)/Header';
import ConfirmDialog from '../(components)/Modal/ConfirmDialog';
import UserFormModal from '../(components)/Modal/UserFormModal';

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
    await createUser(formData);
  };

  const handleUpdateUser = async (formData: {
    name: string;
    email: string;
  }) => {
    if (!editingUser) return;
    await updateUser({ id: editingUser.userId, ...formData });
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.userId);
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

  if (isLoading) {
    return <div className='py-4'>Loading...</div>;
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
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200' /> Add User
        </button>
      </div>
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
