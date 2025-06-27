'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode } from '@/state';
import { useEffect, useState } from 'react';
import Header from '../(components)/Header';

type UserSetting = {
  label: string;
  value: string | boolean;
  type: 'text' | 'toggle';
  key?: string;
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const mockSettings: UserSetting[] = [
    { label: 'Username', value: 'john_doe', type: 'text' },
    { label: 'Email', value: 'john.doe@example.com', type: 'text' },
    { label: 'Notification', value: true, type: 'toggle' },
    { label: 'Dark Mode', value: isDarkMode, type: 'toggle', key: 'darkMode' },
    { label: 'Language', value: 'English', type: 'text' },
  ];

  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);

  // Sync settings with Redux state
  useEffect(() => {
    setUserSettings((prev) =>
      prev.map((setting) =>
        setting.key === 'darkMode' ? { ...setting, value: isDarkMode } : setting
      )
    );
  }, [isDarkMode]);

  const handleToggleChange = (index: number) => {
    const setting = userSettings[index];

    if (setting.key === 'darkMode') {
      dispatch(setIsDarkMode(!isDarkMode));
    } else {
      const settingsCopy = [...userSettings];
      settingsCopy[index].value = !settingsCopy[index].value as boolean;
      setUserSettings(settingsCopy);
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
                key={setting.label}
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
                      className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400'
                      value={setting.value as string}
                      onChange={(e) => {
                        const settingsCopy = [...userSettings];
                        settingsCopy[index].value = e.target.value;
                        setUserSettings(settingsCopy);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
