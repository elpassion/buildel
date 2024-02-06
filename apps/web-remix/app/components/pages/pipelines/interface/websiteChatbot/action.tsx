import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { AliasResponse } from "~/components/pages/pipelines/contracts";
import { getAlias } from "~/components/pages/pipelines/alias.utils";
import { schema } from "./schema";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    patch: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");
      const aliasId = getAlias(request.url);

      const validator = withZod(schema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const isLatestPipeline = !aliasId || aliasId === "latest";

      const url = isLatestPipeline
        ? `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
        : `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases/${aliasId}`;

      const body = isLatestPipeline
        ? {
            pipeline: { interface_config: result.data },
          }
        : {
            alias: { interface_config: result.data },
          };

      const res = await fetch(AliasResponse, url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return json(res.data, {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Alias updated",
              description: `You've successfully updated workflow alias`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
