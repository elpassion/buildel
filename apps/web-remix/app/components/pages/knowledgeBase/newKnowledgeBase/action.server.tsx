import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import invariant from "tiny-invariant";
import { validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { actionBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";
import { CreateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(CreateCollectionSchema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      await knowledgeBaseApi.createCollection(
        params.organizationId,
        result.data
      );

      const collectionName = result.data.collection_name;

      return redirect(
        routes.collectionFiles(params.organizationId, collectionName),
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Collection created",
                description: `You've created ${collectionName} collection`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
