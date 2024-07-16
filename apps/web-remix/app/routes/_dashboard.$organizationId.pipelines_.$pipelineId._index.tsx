import { redirect } from '@remix-run/node';
import type { DataFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';

export async function loader(loaderArgs: DataFunctionArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return redirect(
      routes.pipelineBuild(params.organizationId, params.pipelineId),
    );
  })(loaderArgs);
}
