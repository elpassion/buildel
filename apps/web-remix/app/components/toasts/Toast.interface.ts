import type { SmallToastProps } from "@elpassion/taco";
import { ToastOptions } from "react-hot-toast";

export type ToastProps = {
  options?: Pick<ToastOptions, "duration" | "position">;
} & Partial<SmallToastProps>;
