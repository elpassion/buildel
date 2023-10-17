import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { z } from "zod";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const name = (await request.formData()).get("name");

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/secrets/${name}`,
        { method: "DELETE" }
      );

      return json({});
    },
  })(actionArgs);
}
