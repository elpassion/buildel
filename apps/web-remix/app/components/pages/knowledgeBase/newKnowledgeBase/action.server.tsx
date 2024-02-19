import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import invariant from "tiny-invariant";
import { validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { actionBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";
import { schema } from "./schema";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memory_collections`,
        { method: "POST", body: JSON.stringify(result.data) }
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
