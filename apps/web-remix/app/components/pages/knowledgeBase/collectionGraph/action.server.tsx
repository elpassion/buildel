import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      invariant(params.collectionName, 'collectionName not found');

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      const {
        data: { id: collectionId },
      } = await knowledgeBaseApi.getCollectionByName(
        params.organizationId,
        params.collectionName,
      );

      const { data: graph } = await knowledgeBaseApi.generateCollectionGraph(
        params.organizationId,
        collectionId,
      );

      return json({ graph });
    },
    delete: async ({ params }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      invariant(params.collectionName, 'collectionName not found');

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      const {
        data: { id: collectionId },
      } = await knowledgeBaseApi.getCollectionByName(
        params.organizationId,
        params.collectionName,
      );

      await knowledgeBaseApi.stopGraphGeneration(
        params.organizationId,
        collectionId,
      );

      return json({});
    },
  })(actionArgs);
}
