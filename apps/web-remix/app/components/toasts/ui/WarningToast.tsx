import { SmallToast } from '@elpassion/taco';
import { Info } from 'lucide-react';

import type { ToastProps } from '../Toast.interface';

export const WarningToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Info className="w-4 h-4" />}
      backgroundColor="bg-yellow-700"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
