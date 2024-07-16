import { toast } from "react-hot-toast";
import { ErrorToast } from "./ui/ErrorToast";
import type { ToastProps } from "./Toast.interface";

export const errorToast = (props?: ToastProps | string) => {
  if (typeof props === "string") {
    return toast((t) => (
      <ErrorToast title={props} onClose={() => toast.dismiss(t.id)} />
    ));
  }

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
