import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { CreateUpdateSecretSchema } from "~/api/secrets/secrets.contracts";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { SecretsApi } from "~/api/secrets/SecretsApi";
import { assert } from "~/utils/assert";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const name = (await request.formData()).get("name");

      assert(name);

      const secretsApi = new SecretsApi(fetch);

      await secretsApi.deleteSecret(params.organizationId, name as string);

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Secret deleted",
                description: `You've successfully deleted the secret`,
              },
            }),
          },
        }
      );
    },
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const validator = withZod(CreateUpdateSecretSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const secretsApi = new SecretsApi(fetch);

      await secretsApi.updateSecret(params.organizationId, result.data);

      return redirect(routes.secrets(params.organizationId), {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Secret updated",
              description: `You've successfully updated secret`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
