import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { UploadDatasetFileSchema } from '~/api/datasets/datasets.contracts';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.datasetId, 'Missing datasetId');

      const formData = await request.formData();
      const rowId = formData.get('rowId');

      assert(rowId, 'rowId not found');

      const datasetApi = new DatasetApi(fetch);

      await datasetApi.deleteDatasetRow(
        params.organizationId,
        params.datasetId,
        rowId as string,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Row deleted',
                description: `You've successfully deleted Dataset Row`,
              },
            }),
          },
        },
      );
    },
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      invariant(params.datasetId, 'Missing datasetId');

      const validator = withZod(UploadDatasetFileSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const datasetApi = new DatasetApi(fetch);

      const { data: dataset } = await datasetApi.uploadDatasetFile(
        params.organizationId,
        params.datasetId,
        result.data,
      );

      return redirect(routes.dataset(params.organizationId, dataset.data.id), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Dataset updated',
              description: `You've updated ${dataset.data.name} dataset`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
