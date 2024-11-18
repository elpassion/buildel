import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const pipelineApi = new PipelineApi(fetch);
    const organizationApi = new OrganizationApi(fetch);

    const searchParams = new URL(request.url).searchParams;

    if (!searchParams.has('page')) {
      searchParams.set('per_page', '30');
    }

    const { page, per_page, search } = getParamsPagination(searchParams);

    const pipelinesPromise = pipelineApi.getPipelines(params.organizationId, {
      page,
      per_page,
      search,
    });

    const favoritesPipelinesPromise = pipelineApi.getPipelines(
      params.organizationId,
      { favorites: true, search },
    );

    const templatesPromise = organizationApi.getTemplates(
      params.organizationId,
    );

    const [{ data: pipelines }, { data: favorites }, templates] =
      await Promise.all([
        pipelinesPromise,
        favoritesPipelinesPromise,
        templatesPromise,
      ]);

    const totalItems = pipelines.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      templates: templates.data,
      pipelines: pipelines.data,
      favorites: favorites.data,
      organizationId: params.organizationId,
      pagination: { page, per_page, search, totalItems, totalPages },
    });
  })(args);
}
