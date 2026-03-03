import { ProductFormValues, productFormSchema } from '@/lib/formSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Header from '../Header';

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormValues) => void;
};

const CreateProduct = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      stockQuantity: 0,
      rating: 0,
      stockThreshold: 10,
    },
  });

  const onFormSubmit = (data: ProductFormValues) => {
    onCreate(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const labelCss = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCss =
    'block w-full mb-1 p-2 border-gray-500 dark:border-gray-600 border-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  const errorCss = 'text-red-500 text-xs mb-2';

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-20'>
      <div className='relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
        <Header name='Create New Product' />
        <form onSubmit={handleSubmit(onFormSubmit)} className='mt-5'>
          {/* PRODUCT NAME */}
          <label className={labelCss}>Product Name</label>
          <input
            type='text'
            placeholder='Name'
            {...register('name')}
            className={inputCss}
          />
          {errors.name && <p className={errorCss}>{errors.name.message}</p>}

          {/* PRICE */}
          <label className={labelCss}>Price</label>
          <input
            type='number'
            step='0.01'
            placeholder='Price'
            {...register('price')}
            className={inputCss}
          />
          {errors.price && <p className={errorCss}>{errors.price.message}</p>}

          {/* STOCK QUANTITY */}
          <label className={labelCss}>Stock Quantity</label>
          <input
            type='number'
            placeholder='Stock Quantity'
            {...register('stockQuantity')}
            className={inputCss}
          />
          {errors.stockQuantity && (
            <p className={errorCss}>{errors.stockQuantity.message}</p>
          )}

          {/* RATING */}
          <label className={labelCss}>Rating</label>
          <input
            type='number'
            step='0.1'
            placeholder='Rating (0-5)'
            {...register('rating')}
            className={inputCss}
          />
          {errors.rating && <p className={errorCss}>{errors.rating.message}</p>}

          {/* STOCK THRESHOLD */}
          <label className={labelCss}>Low Stock Threshold</label>
          <input
            type='number'
            placeholder='Low stock alert threshold'
            {...register('stockThreshold')}
            className={inputCss}
          />
          {errors.stockThreshold && (
            <p className={errorCss}>{errors.stockThreshold.message}</p>
          )}

          {/* ACTIONS */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            Create
          </button>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            type='button'
            className='ml-2 px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
