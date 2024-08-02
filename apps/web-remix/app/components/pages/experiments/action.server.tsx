import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ExperimentsApi } from '~/api/experiments/ExperimentsApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const experimentId = (await request.formData()).get('experimentId');

      assert(experimentId, 'experimentId not found');

      const experimentsApi = new ExperimentsApi(fetch);

      await experimentsApi.deleteExperiment(
        params.organizationId,
        experimentId as string,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Experiment deleted',
                description: `You've successfully deleted experiment`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
