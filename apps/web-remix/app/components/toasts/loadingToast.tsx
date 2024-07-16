import { toast } from "react-hot-toast";
import { ErrorToast } from "./ui/ErrorToast";
import { LoadingToast } from "./ui/LoadingToast";
import { SuccessToast } from "./ui/SuccessToast";
import type { ToastProps } from "./Toast.interface";

type LoadingToastProps = {
    success?: ToastProps;
    error?: ToastProps;
    loading?: ToastProps;
};

export const loadingToast = (callback: () => Promise<any>, props?: LoadingToastProps) => {
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
            success: (data) => <SuccessToast
                title={data?.title || success?.title}
                description={data?.description || success?.description}
                backgroundColor={data?.backgroundColor || success?.backgroundColor}
                onClose={() => toast.dismiss()}
            />,
            error: (data) => <ErrorToast
                title={data?.title || error?.title}
                description={data?.description || error?.description}
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
