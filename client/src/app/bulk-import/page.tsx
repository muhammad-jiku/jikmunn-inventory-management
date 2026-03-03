'use client';

import {
  useGetImportHistoryQuery,
  useImportProductsMutation,
} from '@/state/api';
import {
  CheckCircle,
  Download,
  FileUp,
  History,
  Upload,
  XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import Header from '../(components)/Header';

const BulkImportPage = () => {
  const [jsonContent, setJsonContent] = useState('');
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importProducts, { data: importResult, isLoading: importing }] =
    useImportProductsMutation();
  const { data: historyData } = useGetImportHistoryQuery();
  const history = historyData?.data ?? [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;

      // Try to parse as CSV or JSON
      if (file.name.endsWith('.csv')) {
        try {
          const lines = text.split('\n').filter((l) => l.trim());
          const headers = lines[0]
            .split(',')
            .map((h) => h.trim().toLowerCase());
          const products = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim());
            const obj: Record<string, string | number> = {};
            headers.forEach((h, i) => {
              const val = values[i] ?? '';
              obj[h] = [
                'price',
                'rating',
                'stockquantity',
                'stockthreshold',
              ].includes(h)
                ? Number(val)
                : val;
            });
            return obj;
          });
          setJsonContent(JSON.stringify(products, null, 2));
          setParseError('');
        } catch {
          setParseError('Failed to parse CSV file');
        }
      } else {
        setJsonContent(text);
        setParseError('');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      const products = JSON.parse(jsonContent);
      if (!Array.isArray(products)) {
        setParseError('JSON must be an array of products');
        return;
      }
      setParseError('');
      await importProducts({ products });
    } catch {
      setParseError('Invalid JSON format');
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Product',
        price: 29.99,
        stockQuantity: 100,
        rating: 4.5,
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_import_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Bulk Import / Export' />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Import Panel */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Upload className='w-5 h-5 text-blue-500' />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Import Products
            </h2>
          </div>

          {/* File Drop Zone */}
          <div
            className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors mb-4'
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const input = fileInputRef.current;
                if (input) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  input.files = dt.files;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            }}
          >
            <FileUp className='mx-auto w-10 h-10 text-gray-400 mb-2' />
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Drag & drop a JSON or CSV file, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json,.csv'
              className='hidden'
              onChange={handleFileUpload}
            />
          </div>

          {/* JSON Editor */}
          <textarea
            className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm'
            rows={10}
            placeholder='[{"name": "Product", "price": 29.99, "stockQuantity": 100}]'
            value={jsonContent}
            onChange={(e) => {
              setJsonContent(e.target.value);
              setParseError('');
            }}
          />

          {parseError && (
            <p className='text-red-500 text-sm mt-2'>{parseError}</p>
          )}

          <div className='flex gap-3 mt-4'>
            <button
              className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50'
              onClick={handleImport}
              disabled={importing || !jsonContent}
            >
              <Upload className='w-4 h-4' />
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button
              className='flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
              onClick={downloadTemplate}
            >
              <Download className='w-4 h-4' /> Template
            </button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h4 className='font-medium text-gray-900 dark:text-gray-100 mb-2'>
                Import Result
              </h4>
              <div className='flex gap-4 text-sm'>
                <span className='flex items-center gap-1 text-green-600'>
                  <CheckCircle className='w-4 h-4' /> {importResult.successful}{' '}
                  successful
                </span>
                <span className='flex items-center gap-1 text-red-600'>
                  <XCircle className='w-4 h-4' /> {importResult.failed} failed
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <ul className='mt-2 text-sm text-red-500 space-y-1 max-h-32 overflow-y-auto'>
                  {importResult.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Import History */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <History className='w-5 h-5 text-gray-500' />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Import History
            </h2>
          </div>

          {history.length === 0 ? (
            <p className='text-center text-gray-500 py-8'>No import history</p>
          ) : (
            <div className='space-y-3 max-h-[500px] overflow-y-auto'>
              {history.map((h) => (
                <div
                  key={h.importHistoryId}
                  className='border border-gray-200 dark:border-gray-700 rounded-lg p-3'
                >
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {h.fileName}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex gap-3 text-sm'>
                    <span className='text-gray-500'>Total: {h.totalRows}</span>
                    <span className='text-green-600'>{h.successful} OK</span>
                    {h.failed > 0 && (
                      <span className='text-red-500'>{h.failed} Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportPage;
