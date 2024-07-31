import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
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
  })(actionArgs);
}
