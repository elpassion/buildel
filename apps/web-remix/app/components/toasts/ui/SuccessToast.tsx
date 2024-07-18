import { SmallToast } from '@elpassion/taco';
import { Check } from 'lucide-react';

import type { ToastProps } from '../Toast.interface';

export const SuccessToast = ({
  icon,
  withCloseButton = true,
  backgroundColor,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Check className="w-4 h-4" />}
      backgroundColor={backgroundColor ?? 'bg-green-900'}
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
