import type { SmallToastProps } from "@elpassion/taco";
import type { ToastOptions } from "react-hot-toast";

export type ToastProps = {
  options?: Pick<ToastOptions, "duration" | "position">;
} & Partial<SmallToastProps>;
