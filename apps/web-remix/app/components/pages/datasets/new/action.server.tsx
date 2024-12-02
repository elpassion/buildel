import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { CreateDatasetSchema } from '~/api/datasets/datasets.contracts';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(CreateDatasetSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const datasetApi = new DatasetApi(fetch);

      const { data: dataset } = await datasetApi.createDataset(
        params.organizationId,
        result.data,
      );

      return redirect(routes.dataset(params.organizationId, dataset.data.id), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Dataset created',
              description: `You've created ${dataset.data.name} dataset`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
