import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { CreateSecretSchema } from '~/api/secrets/secrets.contracts';
import { SecretsApi } from '~/api/secrets/SecretsApi';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(CreateSecretSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const secretsApi = new SecretsApi(fetch);

      await secretsApi.createSecret(params.organizationId, result.data);

      return redirect(routes.secrets(params.organizationId), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Secret created',
              description: `You've successfully created a new secret`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
