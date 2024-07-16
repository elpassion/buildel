import { json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      return json({});
    },
  })(actionArgs);
}
