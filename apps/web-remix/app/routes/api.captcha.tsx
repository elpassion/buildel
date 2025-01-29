import type { ActionFunctionArgs } from '@remix-run/node';

import { assert } from '~/utils/assert';

export const action = async (args: ActionFunctionArgs) => {
  assert(process.env.GOOGLE_CLIENT_SECRET, 'Missing GOOGLE_CAPTCHA_SECRET');

  const body = await args.request.json();

  if (!body.token) {
    return new Response('Missing captcha token', { status: 400 });
  }

  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${body.token}`,
    { method: 'POST' },
  ).then((res) => res.json());

  if (res.success === true) {
    return new Response('ok', { status: 200 });
  }

  return new Response('validation failed', { status: 400 });
};
