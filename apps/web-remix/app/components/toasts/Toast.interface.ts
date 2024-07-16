import type { ToastOptions } from 'react-hot-toast';
import type { SmallToastProps } from '@elpassion/taco';

export type ToastProps = {
  options?: Pick<ToastOptions, 'duration' | 'position'>;
} & Partial<SmallToastProps>;
