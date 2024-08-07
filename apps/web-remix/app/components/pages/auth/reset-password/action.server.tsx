import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';

import { AuthApi } from '~/api/auth/AuthApi';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';

import { schema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const authApi = new AuthApi(fetch);

      await authApi.resetPassword(result.data.email);

      const redirectTo = routes.resetPasswordSent();

      return redirect(redirectTo);
    },
  })(actionArgs);
}
