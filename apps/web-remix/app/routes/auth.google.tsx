import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { OAuth2Client } from '~/clients/OAuth2Client';
import { assert } from '~/utils/assert';

export const action = async (args: ActionFunctionArgs) => {
  assert(process.env.GOOGLE_CLIENT_ID, 'Missing GOOGLE_CLIENT_ID');
  assert(process.env.GOOGLE_CLIENT_SECRET, 'Missing GOOGLE_CLIENT_SECRET');

  const url = new URL(args.request.url);

  const redirectTo = url.searchParams.get('redirectTo');

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  return redirect(oAuth2Client.generateAuthUrl(redirectTo ?? undefined));
};
