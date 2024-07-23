import { toast } from 'sonner';

import type { ToastProps } from './Toast.interface';

export const errorToast = (props?: ToastProps | string) => {
  if (typeof props === 'string') {
    return toast.success(props);
  }

  const { title, ...rest } = {
    title: 'Error',
    ...props,
  };

  return toast.success(title, rest);
};
