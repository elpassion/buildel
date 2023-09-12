import { ActionArgs, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { z } from "zod";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    delete: async ({ request }, { fetch }) => {
      await fetch(z.any(), "/users/log_out", {
        method: "DELETE",
      });

      return redirect("/login");
    },
  })(actionArgs);
}
