import { toast } from 'sonner';

import type { ToastProps } from './Toast.interface';

type LoadingToastProps = {
  success?: ToastProps;
  error?: ToastProps;
  loading?: ToastProps;
};

export const loadingToast = (
  callback: () => Promise<any>,
  props?: LoadingToastProps,
) => {
  const { loading, success, error } = {
    ...props,
  };

  return toast.promise(
    callback(),
    {
      loading: `${loading?.title} ${loading?.description}`,
      success: (data) =>
        `${data?.title || success?.title} ${data?.description || success?.description}`,
      error: (data) =>
        `${data?.title || error?.title} ${data?.description || error?.description}`,
      duration: Infinity,
    },
    // {
    //   loading: {
    //     duration: Infinity,
    //   },
    //   success: {
    //     duration: 5000,
    //   },
    //   error: {
    //     duration: 5000,
    //   },
    // },
  );
};
