import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import z from 'zod';

import { CurrentUserResponse } from '~/api/CurrentUserApi';
import { OAuth2Client } from '~/clients/OAuth2Client';
import { loaderBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { setCurrentUser } from '~/utils/currentUser.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    assert(process.env.GITHUB_CLIENT_ID, 'Missing GITHUB_CLIENT_ID');
    assert(process.env.GITHUB_CLIENT_SECRET, 'Missing GITHUB_CLIENT_SECRET');

    const url = new URL(request.url);

    const code = url.searchParams.get('code');

    if (!code) {
      return redirect(routes.login, {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            error: {
              title: 'Ups',
              description: 'Something went wrong!',
            },
          }),
        },
      });
    }

    const token = await fetch(
      z.any(),
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }),
      },
    );

    const response = await fetch(z.any(), '/users/github/log_in', {
      method: 'POST',
      body: JSON.stringify({ token: token.data.access_token }),
    });

    const authCookie = response.headers.get('Set-Cookie')!;

    const meResponse = await fetch(CurrentUserResponse, '/users/me', {
      headers: {
        Cookie: authCookie,
      },
    });

    const sessionCookie = await setCurrentUser(request, meResponse.data);

    const headers = new Headers();
    headers.append('Set-Cookie', authCookie);
    headers.append('Set-Cookie', sessionCookie);

    return redirect(routes.dashboard, {
      headers,
    });
  })(args);
}
