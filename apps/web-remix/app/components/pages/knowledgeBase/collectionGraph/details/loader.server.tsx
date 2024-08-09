import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { NotFoundError } from '~/utils/errors';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.collectionName, 'collectionName not found');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const url = new URL(request.url);
    const chunk_id = url.searchParams.get('chunk_id');
    const query = url.searchParams.get('query') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const token_limit =
      typeof url.searchParams.get('token_limit') === 'string'
        ? Number(url.searchParams.get('token_limit'))
        : undefined;
    const extend_neighbors =
      Boolean(url.searchParams.get('extend_neighbors')) ?? false;
    const extend_parents =
      Boolean(url.searchParams.get('extend_parents')) ?? false;
    const searchParams = {
      query,
      limit,
      token_limit,
      extend_neighbors,
      extend_parents,
    };
    if (!chunk_id) throw new NotFoundError();

    const { data: details } = await knowledgeBaseApi.getGraphChunkDetails(
      params.organizationId,
      collectionId,
      chunk_id,
    );

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      details: details,
      searchParams,
    });
  })(args);
}
