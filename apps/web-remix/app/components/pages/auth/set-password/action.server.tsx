import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

import { AuthApi } from '~/api/auth/AuthApi';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { schema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const authApi = new AuthApi(fetch);

      await authApi.setPassword(result.data);

      const redirectTo = routes.login;

      return redirect(redirectTo);
    },
  })(actionArgs);
}
