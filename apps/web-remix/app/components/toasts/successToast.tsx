import { toast, ToastOptions } from "react-hot-toast";
import { ToastProps } from "./Toast.interface";
import { SuccessToast } from "./ui/SuccessToast";

type IToastProps = {
  options?: Pick<ToastOptions, "duration" | "position">;
} & Partial<ToastProps>;

export const successToast = (props?: IToastProps) => {
  const { title, options, ...rest } = {
    title: "Success",
    ...props,
  };

  return toast(
    (t) => (
      <SuccessToast
        title={title}
        onClose={() => toast.dismiss(t.id)}
        {...rest}
      />
    ),
    options
  );
};
