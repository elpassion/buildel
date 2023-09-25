import { Toaster as ReactHotToaster } from "react-hot-toast";

export const Toaster = () => (
  <ReactHotToaster
    position="top-right"
    gutter={4}
    toastOptions={{
      duration: 113000,
      className: "!bg-transparent !p-0 !shadow-none",
    }}
    containerClassName="-mt-1"
  />
);
