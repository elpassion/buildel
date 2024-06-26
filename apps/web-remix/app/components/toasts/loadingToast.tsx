import { toast } from "react-hot-toast";
import { ToastProps } from "./Toast.interface";
import { SuccessToast } from "./ui/SuccessToast";
import { ErrorToast } from "./ui/ErrorToast";
import { LoadingToast } from "./ui/LoadingToast";

type LoadingToastProps = {
    success?: ToastProps;
    error?: ToastProps;
    loading?: ToastProps;
};

export const loadingToast = (callback: () => Promise<unknown>, props?: LoadingToastProps) => {
    const { loading, success, error } = {
        ...props,
    };

    return toast.promise(
        callback(),
        {
            loading: <LoadingToast
                {...loading}
                withCloseButton={false}
                onClose={() => toast.dismiss()}
            />,
            success: <SuccessToast
                {...success}
                onClose={() => toast.dismiss()}
            />,
            error: <ErrorToast
                {...error}
                onClose={() => toast.dismiss()}
            />,
        },
        {
            loading: {
                duration: Infinity,
            },
            success: {
                duration: 5000,
            },
            error: {
                duration: 5000,
            },
        }
    );
};
