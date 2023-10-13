import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      return json({});
    },
  })(actionArgs);
}
