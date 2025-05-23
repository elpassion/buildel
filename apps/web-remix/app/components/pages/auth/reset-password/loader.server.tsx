import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { requireNotLogin } from '~/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireNotLogin(request);
  return json({ googleCaptchaKey: process.env.GOOGLE_CAPTCHA_KEY ?? null });
}
