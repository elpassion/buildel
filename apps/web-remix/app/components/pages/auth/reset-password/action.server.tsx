import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

import { AuthApi } from '~/api/auth/AuthApi';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { schema, schemaWithCaptcha } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch: superFetch }) => {
      const isCaptchaEnabled = !!process.env.GOOGLE_CAPTCHA_KEY;

      const validator = withZod(isCaptchaEnabled ? schemaWithCaptcha : schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      if (isCaptchaEnabled) {
        const captchaResponse = await fetch(
          `${process.env.PAGE_URL}/api/captcha`,
          {
            method: 'POST',
            //@ts-ignore
            body: JSON.stringify({ token: result.data.captchaToken as string }),
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
      }

      const authApi = new AuthApi(superFetch);

      await authApi.resetPassword(result.data.email);

      const redirectTo = routes.resetPasswordSent();

      return redirect(redirectTo);
    },
  })(actionArgs);
}
