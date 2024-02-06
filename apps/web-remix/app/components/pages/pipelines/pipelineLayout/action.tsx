import { ActionFunctionArgs, json } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { z } from "zod";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { setServerToast } from "~/utils/toast.server";
import { createAliasSchema } from "./schema";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(createAliasSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alias: result.data,
          }),
        }
      );

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Alias created",
                description: `You've successfully created workflow alias`,
              },
            }),
          },
        }
      );
    },
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(z.object({ id: z.number() }));

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases/${result.data.id}`,
        {
          method: "DELETE",
        }
      );

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Alias deleted",
                description: `You've successfully deleted workflow alias`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
