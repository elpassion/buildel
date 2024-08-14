import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import type { IPrevNextNode } from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.types';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.collectionName, 'collectionName not found');

    const url = new URL(request.url);
    const chunk_id = url.searchParams.get('chunk_id');
    const query = url.searchParams.get('query') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const token_limit =
      typeof url.searchParams.get('token_limit') === 'string'
        ? Number(url.searchParams.get('token_limit'))
        : undefined;
    const extend_neighbors =
      url.searchParams.get('extend_neighbors') === 'true';
    const extend_parents = url.searchParams.get('extend_parents') === 'true';
    const memory_id = url.searchParams.get('memory_id') ? Number(url.searchParams.get('memory_id')) : undefined;

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const graphPromise = knowledgeBaseApi.getCollectionGraph(
      params.organizationId,
      collectionId,
    );
    const graphStatePromise = knowledgeBaseApi.getCollectionGraphState(
      params.organizationId,
      collectionId,
    );

    const knowledgeBase = await knowledgeBaseApi.getCollectionMemories(
      params.organizationId,
      collectionId,
    );

    const [graph, graphState] = await Promise.all([
      graphPromise,
      graphStatePromise,
    ]);

    const activeChunk =
      graph.data.nodes.find((node) => node.id === chunk_id) ?? null;

    let prevNode: IPrevNextNode = null;
    let nextNode: IPrevNextNode = null;

    if (activeChunk) {
      const chunkDetailsPromise = knowledgeBaseApi.getGraphChunkDetails(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );

      const [details] = await Promise.all([chunkDetailsPromise]);

      prevNode = details.data.prev;
      nextNode = details.data.next;
    }

    const searchParams = {
      query,
      limit,
      token_limit,
      extend_neighbors,
      extend_parents,
      memory_id,
    };

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      graph: graph.data,
      graphState: graphState.data,
      activeChunk,
      prevNode,
      nextNode,
      searchParams,
      fileList: knowledgeBase.data,
    });
  })(args);
}
