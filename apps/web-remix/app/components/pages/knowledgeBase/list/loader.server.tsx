import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const searchParams = new URL(request.url).searchParams;

    const { page, per_page, search, ...rest } = getParamsPagination(
      searchParams,
      {
        per_page: 10,
      },
    );

    const collections = await knowledgeBaseApi.getCollections(
      params.organizationId,
      { search, per_page, page },
    );

    const totalItems = collections.data.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      organizationId: params.organizationId,
      collections: collections.data.data,
      pagination: { page, per_page, totalPages, totalItems, search, ...rest },
      search,
    });
  })(args);
}
