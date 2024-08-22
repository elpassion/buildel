import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { UploadDatasetFileSchema } from '~/api/datasets/datasets.contracts';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import type { fetchTyped } from '~/utils/fetch.server';
import { routes } from '~/utils/routes.utils';
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

async function deleteOne(
  { request, params }: ActionFunctionArgs,
  fetch: typeof fetchTyped,
) {
  invariant(params.organizationId, 'Missing organizationId');
  invariant(params.datasetId, 'Missing datasetId');

  const body = await request.json();
  const rowId = body['rowId'];

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
}

async function deleteMany(
  { request, params }: ActionFunctionArgs,
  fetch: typeof fetchTyped,
) {
  invariant(params.organizationId, 'Missing organizationId');
  invariant(params.datasetId, 'Missing datasetId');

  const datasetApi = new DatasetApi(fetch);

  const validator = withZod(z.object({ rowIds: z.array(z.string()) }));

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
  const ids = result.data.rowIds;

  const promises = await Promise.allSettled(
    ids.map((rowId) => {
      return datasetApi.deleteDatasetRow(
        params.organizationId as string,
        params.datasetId as string,
        rowId,
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
            error: 'Not all Dataset Rows were deleted. Please try again.',
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
            title: 'Rows deleted',
            description: `You've successfully deleted ${ids.length} Dataset Rows`,
          },
        }),
      },
    },
  );
}
