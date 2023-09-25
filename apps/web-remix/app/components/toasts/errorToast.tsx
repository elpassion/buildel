import { toast, ToastOptions } from "react-hot-toast";
import { ToastProps } from "./Toast.interface";
import { ErrorToast } from "./ui/ErrorToast";

type IToastProps = {
  options?: Pick<ToastOptions, "duration" | "position">;
} & Partial<ToastProps>;

export const errorToast = (props?: IToastProps) => {
  const { title, options, ...rest } = {
    title: "Error",
    ...props,
  };

  return toast(
    (t) => (
      <ErrorToast title={title} onClose={() => toast.dismiss(t.id)} {...rest} />
    ),
    options
  );
};
