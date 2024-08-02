import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ExperimentsApi } from '~/api/experiments/ExperimentsApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.experimentId, 'experimentId not found');
    invariant(params.runId, 'runId not found');

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);

    const experimentsApi = new ExperimentsApi(fetch);

    const experimentPromise = experimentsApi.getExperiment(
      params.organizationId,
      params.experimentId,
    );

    const experimentRunRunsPromise = experimentsApi.getExperimentRunRuns(
      params.organizationId,
      params.experimentId,
      params.runId,
      { page, per_page, search: search ?? '' },
    );

    const [{ data: experiment }, { data: experimentRunRuns }] =
      await Promise.all([experimentPromise, experimentRunRunsPromise]);

    const totalItems = experimentRunRuns.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      organizationId: params.organizationId,
      experimentId: params.experimentId,
      runId: params.runId,
      experiment: experiment.data,
      experimentRunRuns: experimentRunRuns.data,
      pagination,
    });
  })(args);
}
