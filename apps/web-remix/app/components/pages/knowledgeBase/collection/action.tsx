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
      invariant(params.collectionName, "Missing collectionName");

      const memoryId = (await request.formData()).get("memoryId");
      const collectionName = params.collectionName;

      const {
        data: { id: collectionId },
      } = await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memory_collections?collection_name=${collectionName}`
      );

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memory_collections/${collectionId}/memories/${memoryId}`,
        { method: "DELETE" }
      );
      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "File deleted",
                description: `You've successfully deleted file`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
