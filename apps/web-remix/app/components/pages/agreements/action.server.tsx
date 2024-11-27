import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';

import { CurrentUserApi, UpdateUserSchema } from '~/api/CurrentUserApi';
import { actionBuilder, validationError } from '~/utils.server';
import { setCurrentUser } from '~/utils/currentUser.server';
import { routes } from '~/utils/routes.utils';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ request }, { fetch }) => {
      const validator = withZod(UpdateUserSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const currentUserApi = new CurrentUserApi(fetch);

      const meResponse = await currentUserApi.updateUser(result.data);

      const sessionCookie = await setCurrentUser(request, meResponse.data);

      throw redirect(routes.dashboard, {
        headers: {
          'Set-Cookie': sessionCookie,
        },
      });
    },
  })(actionArgs);
}
