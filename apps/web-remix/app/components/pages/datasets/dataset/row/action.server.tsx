import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { UpdateDatasetRowSchema } from '~/api/datasets/datasets.contracts';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.datasetId, 'Missing datasetId');
      invariant(params.rowId, 'Missing datasetId');

      const validator = withZod(UpdateDatasetRowSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const datasetApi = new DatasetApi(fetch);

      await datasetApi.updateDatasetRow(
        params.organizationId,
        params.datasetId,
        params.rowId,
        JSON.parse(result.data.data),
      );

      const searchParams = new URL(request.url).searchParams;
      const { page, per_page } = getParamsPagination(searchParams);
      const pagination = { page, per_page };

      return redirect(
        routes.dataset(params.organizationId, params.datasetId, pagination),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Row updated',
                description: `You've successfully updated Dataset Row`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
