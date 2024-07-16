import { toast } from "react-hot-toast";
import { WarningToast } from "./ui/WarningToast";
import type { ToastProps } from "./Toast.interface";

export const warningToast = (props?: ToastProps | string) => {
  if (typeof props === "string") {
    return toast((t) => (
      <WarningToast title={props} onClose={() => toast.dismiss(t.id)} />
    ));
  }

  const { title, options, ...rest } = {
    title: "Warning",
    ...props,
  };

  return toast(
    (t) => (
      <WarningToast
        title={title}
        onClose={() => toast.dismiss(t.id)}
        {...rest}
      />
    ),
    options
  );
};
