import { toast } from 'sonner';

import type { ToastProps } from './Toast.interface';

export const successToast = (props?: ToastProps | string) => {
  if (typeof props === 'string') {
    return toast.success(props);
  }

  const { title, ...rest } = {
    title: 'Success',
    ...props,
  };

  return toast.success(title, {
    action: {
      label: 'Close',
      onClick: () => {},
    },
    ...rest,
  });
};
