import { toast } from "react-hot-toast";
import { SuccessToast } from "./ui/SuccessToast";
import type { ToastProps } from "./Toast.interface";

export const successToast = (props?: ToastProps | string) => {
  if (typeof props === "string") {
    return toast((t) => (
      <SuccessToast title={props} onClose={() => toast.dismiss(t.id)} />
    ));
  }

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
