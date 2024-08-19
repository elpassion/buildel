import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';

import { CurrentUserApi, UpdateUserSchema } from '~/api/CurrentUserApi';
import { commitSession, getSession } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    //eslint-disable-next-line
    //@ts-ignore
    put: async ({ request }, { fetch }) => {
      const validator = withZod(UpdateUserSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const currentUserApi = new CurrentUserApi(fetch);

      const meResponse = await currentUserApi.updateUser(result.data);

      const toastsCookie = await setServerToast(request, {
        success: {
          title: 'Settings updated',
          description: `You've successfully updated profile settings`,
        },
      });

      const session = await getSession(toastsCookie);
      session.set('user', meResponse.data);

      return json(
        { user: meResponse.data },
        {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        },
      );
    },
  })(actionArgs);
}
