import { ToastProps } from "../Toast.interface";
import { Icon, SmallToast } from "@elpassion/taco";

export const ErrorToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Icon iconName="info" />}
      backgroundColor="bg-red-900"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
