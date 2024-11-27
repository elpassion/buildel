import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { UpdateDatasetSchema } from '~/api/datasets/datasets.contracts';
import { requireLogin } from '~/session.server';
import { actionBuilder, validationError } from '~/utils.server';
import { assert } from '~/utils/assert';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const datasetId = (await request.formData()).get('datasetId');

      assert(datasetId, 'datasetId not found');

      const datasetApi = new DatasetApi(fetch);

      await datasetApi.deleteDataset(
        params.organizationId,
        datasetId as string,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Dataset deleted',
                description: `You've successfully deleted dataset`,
              },
            }),
          },
        },
      );
    },
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const validator = withZod(UpdateDatasetSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const datasetApi = new DatasetApi(fetch);

      await datasetApi.updateDataset(params.organizationId, result.data.id, {
        name: result.data.name,
      });

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Dataset updated',
                description: `You've successfully updated dataset`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
