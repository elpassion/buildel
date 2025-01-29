import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

import { AuthApi } from '~/api/auth/AuthApi';
import { CurrentUserResponse } from '~/api/CurrentUserApi';
import { actionBuilder, validationError } from '~/utils.server';
import { setCurrentUser } from '~/utils/currentUser.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { schema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch: extraFetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const captchaResponse = await fetch(
        `${process.env.PAGE_URL}/api/captcha`,
        {
          method: 'POST',
          body: JSON.stringify({ token: result.data.captchaToken }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (captchaResponse.status !== 200) {
        return validationError({
          fieldErrors: { captchaToken: 'Captcha validation failed' },
        });
      }

      const authApi = new AuthApi(extraFetch);

      const response = await authApi.signUp(result.data.user);

      const authCookie = response.headers.get('Set-Cookie')!;

      const meResponse = await extraFetch(CurrentUserResponse, '/users/me', {
        headers: {
          Cookie: authCookie,
        },
      });

      const sessionCookie = await setCurrentUser(request, meResponse.data);

      const headers = new Headers();
      headers.append('Set-Cookie', authCookie);
      headers.append('Set-Cookie', sessionCookie);

      const redirectTo = result.data.redirectTo || routes.dashboard;

      return redirect(redirectTo, {
        headers,
      });
    },
  })(actionArgs);
}
