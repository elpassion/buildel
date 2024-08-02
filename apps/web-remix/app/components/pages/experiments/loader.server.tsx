import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ExperimentsApi } from '~/api/experiments/ExperimentsApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const experimentsApi = new ExperimentsApi(fetch);

    const { data: experiments } = await experimentsApi.getExperiments(
      params.organizationId,
    );

    return json({
      organizationId: params.organizationId,
      experiments: experiments.data,
    });
  })(args);
}
