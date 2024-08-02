import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { CreateExperimentSchema } from '~/api/experiments/experiments.contracts';
import { ExperimentsApi } from '~/api/experiments/ExperimentsApi';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(CreateExperimentSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const experimentsApi = new ExperimentsApi(fetch);
      const { data: experiment } = await experimentsApi.createExperiment(
        params.organizationId,
        result.data,
      );

      return redirect(
        routes.experiment(params.organizationId, experiment.data.id),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Experiment created',
                description: `You've created ${experiment.data.name} experiment`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
