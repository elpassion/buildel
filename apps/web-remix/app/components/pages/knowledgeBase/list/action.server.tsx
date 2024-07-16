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

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      const collectionName = (await request.formData()).get('collectionName');
      const {
        data: { id: collectionId },
      } = await knowledgeBaseApi.getCollectionByName(
        params.organizationId,
        collectionName as string,
      );

      await knowledgeBaseApi.deleteCollection(
        params.organizationId,
        collectionId,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Collection deleted',
                description: `You've successfully deleted collection`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
