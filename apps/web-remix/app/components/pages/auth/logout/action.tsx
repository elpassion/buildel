import { ActionArgs, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { z } from "zod";
import { routes } from "~/utils/routes.utils";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    delete: async ({ request }, { fetch }) => {
      await fetch(z.any(), "/users/log_out", {
        method: "DELETE",
      });

      return redirect(routes.login);
    },
  })(actionArgs);
}
