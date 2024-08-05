import { toast } from 'sonner';

import type { ToastProps } from './Toast.interface';

export const warningToast = (props?: ToastProps | string) => {
  if (typeof props === 'string') {
    return toast.warning(props);
  }

  const { title, ...rest } = {
    title: 'Warning',
    ...props,
  };

  return toast.warning(title, {
    action: {
      label: 'Close',
      onClick: () => {},
    },
    ...rest,
  });
};
