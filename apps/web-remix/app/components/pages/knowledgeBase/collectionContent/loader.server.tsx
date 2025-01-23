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
    invariant(params.collectionName, 'collectionName not found');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);
    const searchParams = new URL(request.url).searchParams;

    const { page, per_page, ...rest } = getParamsPagination(searchParams, {
      per_page: 40,
    });

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const knowledgeBase = await knowledgeBaseApi.getCollectionMemories(
      params.organizationId,
      collectionId,
      { page, per_page },
    );

    const totalItems = knowledgeBase.data.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      fileList: knowledgeBase.data.data,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      pagination: { page, per_page, totalPages, totalItems, ...rest },
    });
  })(args);
}
