import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { z } from "zod";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const collectionName = (await request.formData()).get("collectionName");

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memory_collections/${collectionName}`,
        { method: "DELETE" }
      );
      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Collection deleted",
                description: `You've successfully deleted collection`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
