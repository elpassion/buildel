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
    const { search } = getParamsPagination(searchParams);

    const collections = await knowledgeBaseApi.getCollections(
      params.organizationId,
      { search },
    );

    return json({
      organizationId: params.organizationId,
      collections: collections.data,
      search,
    });
  })(args);
}
