import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { actionBuilder } from "~/utils.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, "organizationId not found");
      await requireLogin(request);

      const res = await fetch(
        z.any(),
        `/organizations/${params.organizationId}/api_key`,
        { method: "POST" }
      );

      return json({});
    },
  })(actionArgs);
}
