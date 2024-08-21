import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import type { fetchTyped } from '~/utils/fetch.server';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ request }, { fetch }) => {
      await requireLogin(request);

      const body = await request.clone().json();

      if (body['intent'] === 'DELETE_MANY') {
        return deleteMany(actionArgs, fetch);
      }

      return deleteOne(actionArgs, fetch);
    },
  })(actionArgs);
}

async function deleteOne(
  { request, params }: ActionFunctionArgs,
  fetch: typeof fetchTyped,
) {
  invariant(params.organizationId, 'Missing organizationId');
  invariant(params.collectionName, 'Missing collectionName');

  const body = await request.json();
  const memoryId = body['memoryId'];

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
}

async function deleteMany(
  { request, params }: ActionFunctionArgs,
  fetch: typeof fetchTyped,
) {
  invariant(params.organizationId, 'Missing organizationId');
  invariant(params.collectionName, 'Missing collectionName');

  const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

  const {
    data: { id: collectionId },
  } = await knowledgeBaseApi.getCollectionByName(
    params.organizationId,
    params.collectionName,
  );

  const validator = withZod(z.object({ memoryIds: z.array(z.string()) }));

  const result = await validator.validate(await request.json());

  if (result.error) {
    return json(
      {},
      {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            error: 'Something went wrong. Please try again.',
          }),
        },
      },
    );
  }
  const ids = result.data.memoryIds;

  const promises = await Promise.allSettled(
    ids.map((memoryId) => {
      return knowledgeBaseApi.deleteCollectionMemory(
        params.organizationId as string,
        collectionId,
        memoryId,
      );
    }),
  );

  const hasRejected = promises.some((p) => p.status === 'rejected');

  if (hasRejected) {
    return json(
      {},
      {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            error: 'Not all memories were deleted. Please try again.',
          }),
        },
      },
    );
  }

  return json(
    {},
    {
      headers: {
        'Set-Cookie': await setServerToast(request, {
          success: {
            title: 'Memories deleted',
            description: `You've successfully deleted ${ids.length} memories`,
          },
        }),
      },
    },
  );
}
