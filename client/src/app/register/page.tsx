'use client';

import { useAppDispatch } from '@/app/redux';
import { useRegisterUserMutation } from '@/state/api';
import { setCredentials } from '@/state/authSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await registerUser({ name, email, password }).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );
      router.push('/dashboard');
    } catch (err) {
      const error = err as { data?: { message?: string } };
      setError(error.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputClass =
    'w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              Create Account
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2'>
              Register for inventory management access
            </p>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Full Name
              </label>
              <input
                id='name'
                type='text'
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder='John Doe'
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder='you@example.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder='••••••••'
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                type='password'
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder='••••••••'
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors'
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className='text-center mt-6 text-sm text-gray-500 dark:text-gray-400'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-blue-600 dark:text-blue-400 hover:underline font-medium'
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
