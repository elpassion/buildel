import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { CreateDatasetRowSchema } from '~/api/datasets/datasets.contracts';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { actionBuilder, validationError } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.datasetId, 'Missing datasetId');

      const validator = withZod(CreateDatasetRowSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const datasetApi = new DatasetApi(fetch);

      await datasetApi.createDatasetRow(
        params.organizationId,
        params.datasetId,
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
                title: 'Row created',
                description: `You've successfully created Dataset Row`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
