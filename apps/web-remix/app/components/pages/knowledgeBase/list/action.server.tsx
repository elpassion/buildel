import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { actionBuilder } from "~/utils.server";
import { setServerToast } from "~/utils/toast.server";
import { KnowledgeBaseCollectionFromListResponse } from "../contracts";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const collectionName = (await request.formData()).get("collectionName");
      const {
        data: { id: collectionId },
      } = await fetch(
        KnowledgeBaseCollectionFromListResponse,
        `/organizations/${params.organizationId}/memory_collections?collection_name=${collectionName}`
      );
      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memory_collections/${collectionId}`,
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
