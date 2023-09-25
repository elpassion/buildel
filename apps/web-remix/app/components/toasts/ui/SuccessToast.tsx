import { ToastProps } from "../Toast.interface";
import { Icon, SmallToast } from "@elpassion/taco";

export const SuccessToast = ({
  icon,
  withCloseButton = true,
  ...rest
}: ToastProps) => {
  return (
    <SmallToast
      icon={icon ?? <Icon iconName="check" />}
      backgroundColor="bg-green-900"
      withCloseButton={withCloseButton}
      {...rest}
    />
  );
};
