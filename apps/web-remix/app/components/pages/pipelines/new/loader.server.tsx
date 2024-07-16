import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(() => {
    return json({});
  })(args);
}
