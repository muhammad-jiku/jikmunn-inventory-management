/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import {
  useGetExpensesByCategoryQuery,
  useGetProductsQuery,
  useGetUsersQuery,
} from '@/state/api';
import { CircleDollarSign, Clipboard, Search, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  icon: typeof Clipboard;
  href: string;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: productsRes } = useGetProductsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: usersRes } = useGetUsersQuery(undefined, { skip: !isOpen });
  const { data: expensesRes } = useGetExpensesByCategoryQuery(undefined, {
    skip: !isOpen,
  });

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    productsRes?.data?.forEach((p) => {
      if (p.name.toLowerCase().includes(q)) {
        items.push({
          id: `product-${p.productId}`,
          label: p.name,
          sublabel: `$${p.price.toFixed(2)} · Stock: ${p.stockQuantity}`,
          icon: Clipboard,
          href: '/products',
        });
      }
    });

    usersRes?.data?.forEach((u) => {
      if (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      ) {
        items.push({
          id: `user-${u.userId}`,
          label: u.name,
          sublabel: u.email,
          icon: User,
          href: '/users',
        });
      }
    });

    expensesRes?.data?.forEach((e) => {
      if (e.category.toLowerCase().includes(q)) {
        items.push({
          id: `expense-${e.expenseByCategorySummaryId}`,
          label: e.category,
          sublabel: `$${e.amount}`,
          icon: CircleDollarSign,
          href: '/expenses',
        });
      }
    });

    return items.slice(0, 20);
  }, [query, productsRes, usersRes, expensesRes]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQuery('');
    },
    [router, onClose]
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        navigate(results[selectedIndex].href);
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [results, selectedIndex, navigate, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]'
      onClick={() => onClose()}
    >
      <div
        className='w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
          <Search className='w-5 h-5 text-gray-400' />
          <input
            ref={inputRef}
            type='text'
            placeholder='Search products, users, expenses…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className='flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm'
          />
          <kbd className='hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs font-mono'>
            ESC
          </kbd>
          <button
            onClick={onClose}
            className='sm:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <X className='w-4 h-4 text-gray-500' />
          </button>
        </div>

        {/* Results */}
        <div className='max-h-80 overflow-y-auto'>
          {query && results.length === 0 && (
            <div className='px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400'>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    index === selectedIndex
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  }`}
                />
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                    {item.label}
                  </div>
                  {item.sublabel && (
                    <div className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {!query && (
            <div className='px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500'>
              Type to search across products, users, and expenses
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500'>
          <span className='flex items-center gap-1'>
            <kbd className='px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono'>
              ↑↓
            </kbd>{' '}
            navigate
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono'>
              ↵
            </kbd>{' '}
            open
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono'>
              esc
            </kbd>{' '}
            close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
