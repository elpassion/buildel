import { useEffect } from "react";
import { SessionFlashData } from "~/session.server";
import { errorToast } from "~/components/toasts/errorToast";
import { successToast } from "~/components/toasts/successToast";

export function useServerToasts(toasts: Partial<SessionFlashData>) {
  useEffect(() => {
    if (toasts.error) {
      errorToast(toasts.error);
    }
    if (toasts.success) {
      successToast(toasts.success);
    }
    if (toasts.warning) {
      //@todo implement warning toasts
    }
  }, [toasts]);
}
