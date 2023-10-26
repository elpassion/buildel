import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { setServerToast } from "~/utils/toast.server";
import { z } from "zod";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, "organizationId not found");

      const res = await fetch(
        z.any(),
        `/organizations/${params.organizationId}/api_key`,
        { method: "POST" }
      );

      return json(
        { key: res.data },
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "API Key created",
                description: `You've successfully generated API Key!`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
