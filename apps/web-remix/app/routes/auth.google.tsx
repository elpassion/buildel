import { redirect } from '@remix-run/node';

import { OAuth2Client } from '~/clients/OAuth2Client';
import { assert } from '~/utils/assert';

export const action = async () => {
  assert(process.env.GOOGLE_CLIENT_ID, 'Missing GOOGLE_CLIENT_ID');
  assert(process.env.GOOGLE_CLIENT_SECRET, 'Missing GOOGLE_CLIENT_SECRET');

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  return redirect(oAuth2Client.generateAuthUrl());
};
