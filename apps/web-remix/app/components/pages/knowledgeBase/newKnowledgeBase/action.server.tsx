import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { CreateCollectionSchema } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(CreateCollectionSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      await knowledgeBaseApi.createCollection(
        params.organizationId,
        result.data,
      );

      const collectionName = result.data.collection_name;

      return redirect(
        routes.collectionFiles(params.organizationId, collectionName),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Collection created',
                description: `You've created ${collectionName} collection`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
