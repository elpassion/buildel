import { ToastProps } from "../Toast.interface";
import { Icon, SmallToast } from "@elpassion/taco";

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
