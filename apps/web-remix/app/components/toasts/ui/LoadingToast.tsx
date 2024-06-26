import { ToastProps } from "../Toast.interface";
import { Icon, SmallToast } from "@elpassion/taco";

export const LoadingToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Icon iconName="check" />}
      backgroundColor="bg-blue-900"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
