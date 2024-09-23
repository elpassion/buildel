import type { LoaderFunctionArgs } from '@remix-run/node';

import { interfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params, ...rest }, helpers) => {
    await requireLogin(request);

    return interfaceLoader({ request, params, ...rest }, helpers);
  })(args);
}
