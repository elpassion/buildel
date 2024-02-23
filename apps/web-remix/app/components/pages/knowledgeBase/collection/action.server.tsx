import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { setServerToast } from "~/utils/toast.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.collectionName, "Missing collectionName");

      const memoryId = (await request.formData()).get("memoryId");
      const collectionName = params.collectionName;

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      const {
        data: { id: collectionId },
      } = await knowledgeBaseApi.getCollectionByName(
        params.organizationId,
        collectionName
      );

      await knowledgeBaseApi.deleteCollectionMemory(
        params.organizationId,
        collectionId,
        memoryId as string
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
