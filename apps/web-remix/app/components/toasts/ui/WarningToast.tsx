import { Icon, SmallToast } from '@elpassion/taco';

import type { ToastProps } from '../Toast.interface';

export const WarningToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Icon iconName="info" />}
      backgroundColor="bg-yellow-700"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
