import { toast } from 'sonner';

/** Show a success toast after a CRUD operation */
export const toastSuccess = (message: string) => {
  toast.success(message);
};

/** Show an error toast — extracts message from RTK Query errors */
export const toastError = (
  error: unknown,
  fallback = 'Something went wrong'
) => {
  let message = fallback;

  if (error && typeof error === 'object') {
    const err = error as { data?: { error?: string }; error?: string };
    message = err.data?.error ?? err.error ?? fallback;
  }

  toast.error(message);
};
