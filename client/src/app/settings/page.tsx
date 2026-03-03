/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { toastError, toastSuccess } from '@/lib/toast';
import { setIsDarkMode } from '@/state';
import { useUpdateProfileMutation } from '@/state/api';
import { updateProfile } from '@/state/authSlice';
import { useEffect, useState } from 'react';
import Header from '../(components)/Header';

type UserSetting = {
  label: string;
  value: string | boolean;
  type: 'text' | 'toggle';
  key: string;
  editable?: boolean;
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const authUser = useAppSelector((state) => state.auth.user);

  const [updateProfileMutation, { isLoading: isSaving }] =
    useUpdateProfileMutation();

  const buildSettings = (): UserSetting[] => [
    {
      label: 'Username',
      value: authUser?.name ?? '',
      type: 'text',
      key: 'name',
      editable: true,
    },
    {
      label: 'Email',
      value: authUser?.email ?? '',
      type: 'text',
      key: 'email',
      editable: true,
    },
    {
      label: 'Role',
      value: authUser?.role ?? 'viewer',
      type: 'text',
      key: 'role',
      editable: false,
    },
    {
      label: 'Notification',
      value: true,
      type: 'toggle',
      key: 'notification',
    },
    {
      label: 'Dark Mode',
      value: isDarkMode,
      type: 'toggle',
      key: 'darkMode',
    },
  ];

  const [userSettings, setUserSettings] =
    useState<UserSetting[]>(buildSettings());

  // Sync settings when auth user or dark mode changes
  useEffect(() => {
    setUserSettings((prev) =>
      prev.map((setting) => {
        if (setting.key === 'darkMode')
          return { ...setting, value: isDarkMode };
        if (setting.key === 'name')
          return { ...setting, value: authUser?.name ?? '' };
        if (setting.key === 'email')
          return { ...setting, value: authUser?.email ?? '' };
        if (setting.key === 'role')
          return { ...setting, value: authUser?.role ?? 'viewer' };
        return setting;
      })
    );
  }, [isDarkMode, authUser]);

  const handleToggleChange = (index: number) => {
    const setting = userSettings[index];

    if (setting.key === 'darkMode') {
      dispatch(setIsDarkMode(!isDarkMode));
    } else {
      const settingsCopy = [...userSettings];
      settingsCopy[index] = {
        ...settingsCopy[index],
        value: !settingsCopy[index].value as boolean,
      };
      setUserSettings(settingsCopy);
    }
  };

  const handleTextChange = (index: number, newValue: string) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index] = { ...settingsCopy[index], value: newValue };
    setUserSettings(settingsCopy);
  };

  const handleSaveProfile = async () => {
    const nameVal = userSettings.find((s) => s.key === 'name')?.value as string;
    const emailVal = userSettings.find((s) => s.key === 'email')
      ?.value as string;

    if (!nameVal?.trim()) {
      toastError(null, 'Name cannot be empty');
      return;
    }

    try {
      const result = await updateProfileMutation({
        name: nameVal.trim(),
        email: emailVal.trim(),
      }).unwrap();

      dispatch(updateProfile({ name: result.name, email: result.email }));
      toastSuccess('Profile updated successfully');
    } catch (err) {
      toastError(err, 'Failed to update profile');
    }
  };

  return (
    <div className='w-full'>
      <Header name='User Settings' />

      <div className='overflow-x-auto mt-5 shadow-md'>
        <table className='min-w-full bg-white dark:bg-gray-800 rounded-lg'>
          <thead className='bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
            <tr>
              <th className='text-left py-3 px-4 uppercase font-semibold text-sm'>
                Setting
              </th>
              <th className='text-left py-3 px-4 uppercase font-semibold text-sm'>
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr
                className='hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                key={setting.key}
              >
                <td className='py-2 px-4'>{setting.label}</td>
                <td className='py-2 px-4'>
                  {setting.type === 'toggle' ? (
                    <label className='inline-flex relative items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"
                      ></div>
                    </label>
                  ) : (
                    <input
                      type='text'
                      className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 ${
                        setting.editable === false
                          ? 'opacity-60 cursor-not-allowed'
                          : ''
                      }`}
                      value={setting.value as string}
                      readOnly={setting.editable === false}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='mt-6 flex justify-end'>
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
