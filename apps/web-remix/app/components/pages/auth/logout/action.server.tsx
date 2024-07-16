import { redirect } from "@remix-run/node";
import { z } from "zod";
import { logout } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ request }, { fetch }) => {
      await fetch(z.any(), "/users/log_out", {
        method: "DELETE",
      });

      return redirect(routes.login, {
        headers: await logout(request),
      });
    },
  })(actionArgs);
}
