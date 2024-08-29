import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { UpdateSecretSchema } from '~/api/secrets/secrets.contracts';
import { SecretsApi } from '~/api/secrets/SecretsApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      const name = (await request.formData()).get('name');

      assert(name);

      const secretsApi = new SecretsApi(fetch);

      await secretsApi.deleteSecret(params.organizationId, name as string);

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Secret deleted',
                description: `You've successfully deleted the secret`,
              },
            }),
          },
        },
      );
    },
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const validator = withZod(UpdateSecretSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const secretsApi = new SecretsApi(fetch);

      await secretsApi.updateSecret(params.organizationId, result.data);

      return redirect(routes.secrets(params.organizationId), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Secret updated',
              description: `You've successfully updated secret`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
