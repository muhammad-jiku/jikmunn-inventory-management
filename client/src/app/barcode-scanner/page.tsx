'use client';

import { useLazyGetProductByBarcodeQuery } from '@/state/api';
import { Camera, Keyboard, ScanBarcode } from 'lucide-react';
import { useRef, useState } from 'react';
import Header from '../(components)/Header';

const BarcodeScannerPage = () => {
  const [manualCode, setManualCode] = useState('');
  const [triggerBarcodeLookup, { data: product, isLoading, isError, error }] =
    useLazyGetProductByBarcodeQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLookup = () => {
    const code = manualCode.trim();
    if (code) triggerBarcodeLookup(code);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  };

  return (
    <div className='mx-auto pb-5 w-full'>
      <Header name='Barcode Scanner' />

      <div className='max-w-xl mx-auto'>
        {/* Manual Input */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Keyboard className='w-5 h-5 text-gray-500' />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Enter Barcode Manually
            </h2>
          </div>
          <div className='flex gap-3'>
            <input
              ref={inputRef}
              className='flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg font-mono'
              placeholder='Scan or type barcode...'
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg'
              onClick={handleLookup}
              disabled={isLoading}
            >
              <ScanBarcode className='w-5 h-5' />
              {isLoading ? 'Looking up...' : 'Look Up'}
            </button>
          </div>
          <p className='text-xs text-gray-400 mt-2'>
            Tip: Most USB/Bluetooth barcode scanners act as a keyboard and send
            Enter after the code.
          </p>
        </div>

        {/* Camera Scanner Info */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <Camera className='w-5 h-5 text-gray-500' />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Camera Scanner
            </h2>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            For camera-based barcode scanning, connect a USB/Bluetooth barcode
            scanner or use a dedicated barcode scanning app on your mobile
            device. The manual input field above is compatible with hardware
            scanners that emulate keyboard input.
          </p>
        </div>

        {/* Product Result */}
        {isLoading && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center'>
            <div className='animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2' />
            Looking up product...
          </div>
        )}

        {isError && (
          <div className='bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6 text-center text-red-600 dark:text-red-400'>
            {(error as { data?: { message?: string } })?.data?.message ??
              'No product found with this barcode'}
          </div>
        )}

        {product && !isLoading && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100 mb-4'>
              Product Found
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Name</p>
                <p className='font-medium text-gray-900 dark:text-gray-100'>
                  {product.name}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Price
                </p>
                <p className='font-medium text-gray-900 dark:text-gray-100'>
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Stock Quantity
                </p>
                <p
                  className={`font-medium ${product.stockQuantity <= (product.stockThreshold ?? 10) ? 'text-red-500' : 'text-green-600'}`}
                >
                  {product.stockQuantity}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Rating
                </p>
                <p className='font-medium text-gray-900 dark:text-gray-100'>
                  {product.rating?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
              <div className='col-span-2'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Product ID
                </p>
                <p className='font-mono text-sm text-gray-600 dark:text-gray-300'>
                  {product.productId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScannerPage;
