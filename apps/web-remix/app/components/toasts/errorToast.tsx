import { toast } from 'sonner';

import type { ToastProps } from './Toast.interface';

export const errorToast = (props?: ToastProps | string) => {
  if (typeof props === 'string') {
    return toast.error(props);
  }

  const { title, ...rest } = {
    title: 'Error',
    ...props,
  };

  return toast.error(title, {
    action: {
      label: 'Close',
      onClick: () => {},
    },
    ...rest,
  });
};
