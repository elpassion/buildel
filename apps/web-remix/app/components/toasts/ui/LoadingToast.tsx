import { SmallToast } from '@elpassion/taco';
import { Check } from 'lucide-react';

import type { ToastProps } from '../Toast.interface';

export const LoadingToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Check className="w-4 h-4" />}
      backgroundColor="bg-blue-900"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
