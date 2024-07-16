import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { AuthApi } from '~/api/auth/AuthApi';
import { requireNotLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireNotLogin(request);

    const authApi = new AuthApi(fetch);

    const { data } = await authApi.signUpDisabled();

    if (data.registration_disabled) {
      return redirect(routes.login);
    }

    return json({ googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID });
  })(args);
}
