import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { ApiKeyResponse } from "~/components/pages/variables/contracts";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, "organizationId not found");

      const res = await fetch(
        ApiKeyResponse,
        `/organizations/${params.organizationId}/keys`,
        { method: "POST" }
      );

      return json(
        { key: res.data },
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "API Key created",
                description: `You've successfully created API Key. Make sure to copy it!`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
