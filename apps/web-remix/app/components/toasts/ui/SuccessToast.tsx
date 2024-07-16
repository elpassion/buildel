import { Icon, SmallToast } from '@elpassion/taco';

import type { ToastProps } from '../Toast.interface';

export const SuccessToast = ({
  icon,
  withCloseButton = true,
  backgroundColor,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Icon iconName="check" />}
      backgroundColor={backgroundColor ?? 'bg-green-900'}
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
