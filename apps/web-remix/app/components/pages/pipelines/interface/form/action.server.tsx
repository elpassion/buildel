import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { setServerToast } from '~/utils/toast.server';

import { schema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    // @ts-ignore
    patch: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.pipelineId, 'Missing pipelineId');

      const validator = withZod(schema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);
      const aliasId = pipelineApi.getAliasFromUrl(request.url);

      const isLatestPipeline = !aliasId || aliasId === 'latest';

      const body = {
        interface_config: {
          ...result.data,
        },
      };

      const res = isLatestPipeline
        ? await pipelineApi.updatePipelinePatch(
            params.organizationId,
            params.pipelineId,
            body,
          )
        : await pipelineApi.updateAliasPatch(
            params.organizationId,
            params.pipelineId,
            aliasId,
            body,
          );

      return json(res.data, {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Alias updated',
              description: `You've successfully updated workflow alias`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
