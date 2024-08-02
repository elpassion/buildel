import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.experimentId, 'experimentId not found');

    return redirect(
      routes.experimentRuns(params.organizationId, params.experimentId),
    );
  })(args);
}
