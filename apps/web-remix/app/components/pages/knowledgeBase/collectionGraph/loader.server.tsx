import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import type { z } from 'zod';

import type {
  IKnowledgeBaseSearchChunk,
  MemoryNodeRelated,
} from '~/api/knowledgeBase/knowledgeApi.contracts';
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

    const [graph, graphState] = await Promise.all([
      graphPromise,
      graphStatePromise,
    ]);

    const activeChunk =
      graph.data.nodes.find((node) => node.id === chunk_id) ?? null;

    let relatedNeighbours: z.TypeOf<typeof MemoryNodeRelated>['chunks'] = [];
    let prevNode: IPrevNextNode = null;
    let nextNode: IPrevNextNode = null;

    if (activeChunk) {
      const chunkDetailsPromise = knowledgeBaseApi.getGraphChunkDetails(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );
      const relatedNeighboursPromise = knowledgeBaseApi.getRelatedNeighbours(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );

      const [details, neighbours] = await Promise.all([
        chunkDetailsPromise,
        relatedNeighboursPromise,
      ]);

      relatedNeighbours = neighbours.data.chunks;
      prevNode = details.data.prev;
      nextNode = details.data.next;
    }

    let graphSearchChunks: IKnowledgeBaseSearchChunk[] = [];

    if (query) {
      const { data: searchChunks } =
        await knowledgeBaseApi.searchCollectionChunks(
          params.organizationId,
          collectionId,
          {
            query,
            extend_neighbors: 'false',
            extend_parents: 'false',
          },
        );
      graphSearchChunks = searchChunks.data;
    }

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      graph: graph.data,
      graphState: graphState.data,
      searchChunks: graphSearchChunks.map((chunk) => chunk.id),
      activeChunk,
      relatedNeighbours,
      prevNode,
      nextNode,
      query,
    });
  })(args);
}
