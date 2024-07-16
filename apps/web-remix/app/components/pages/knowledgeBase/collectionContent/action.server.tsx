import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.collectionName, 'Missing collectionName');

      const memoryId = (await request.formData()).get('memoryId');
      const collectionName = params.collectionName;

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      const {
        data: { id: collectionId },
      } = await knowledgeBaseApi.getCollectionByName(
        params.organizationId,
        collectionName,
      );

      await knowledgeBaseApi.deleteCollectionMemory(
        params.organizationId,
        collectionId,
        memoryId as string,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'File deleted',
                description: `You've successfully deleted file`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
