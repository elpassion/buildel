import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { withZod } from "@remix-validated-form/with-zod";
import { actionBuilder } from "~/utils.server";

import { schema } from "./schema";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      return json({});
    },
  })(actionArgs);
}
