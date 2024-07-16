import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { UpdateCollectionSchema } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      const validator = withZod(UpdateCollectionSchema);
      invariant(params.organizationId, 'organizationId not found');
      invariant(params.collectionName, 'collectionName not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

      await knowledgeBaseApi.updateCollection(
        params.organizationId,
        result.data.id,
        result.data,
      );

      return redirect(
        routes.collectionSettings(params.organizationId, params.collectionName),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Collection updated',
                description: `You've successfully updated collection.`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
