import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { routes } from '~/utils/routes.utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect(routes.login);
  }
  return json({ token });
}
