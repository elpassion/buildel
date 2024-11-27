import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { actionBuilder, validationError } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(CreatePipelineSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);
      const { data } = await pipelineApi.createPipeline(
        params.organizationId,
        result.data,
      );

      return redirect(routes.pipeline(params.organizationId, data.id), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Workflow created',
              description: `You've created ${data.name} workflow`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
