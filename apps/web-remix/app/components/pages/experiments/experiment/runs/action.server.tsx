import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ExperimentsApi } from '~/api/experiments/ExperimentsApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.experimentId, 'Missing experimentId');

      const experimentsApi = new ExperimentsApi(fetch);

      await experimentsApi.runExperiment(
        params.organizationId,
        params.experimentId,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Run started',
                description: `You've successfully started Experiment Run`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
