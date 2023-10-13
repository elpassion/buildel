import { toast } from "react-hot-toast";
import { ToastProps } from "./Toast.interface";
import { SuccessToast } from "./ui/SuccessToast";

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
