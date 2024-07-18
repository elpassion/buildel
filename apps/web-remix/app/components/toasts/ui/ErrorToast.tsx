import { SmallToast } from '@elpassion/taco';
import { Info } from 'lucide-react';

import type { ToastProps } from '../Toast.interface';

export const ErrorToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Info className="w-4 h-4" />}
      backgroundColor="bg-red-900"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
