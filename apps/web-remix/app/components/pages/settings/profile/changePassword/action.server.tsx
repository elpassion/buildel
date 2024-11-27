import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { requireLogin } from '~/session.server';
import { actionBuilder, validationError } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

import { changePasswordSchema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      await requireLogin(request);

      const validator = withZod(changePasswordSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      await fetch(z.any(), `/users/password`, {
        method: 'PUT',
        body: JSON.stringify(result.data),
      });

      return redirect(routes.profileSettings(params.organizationId), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Password changed',
              description: `Password successfully changed.`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
