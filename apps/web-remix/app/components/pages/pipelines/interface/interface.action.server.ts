import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import invariant from 'tiny-invariant';

import { InterfaceConfig } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { validationError } from '~/utils.server';
import type { fetchTyped } from '~/utils/fetch.server';
import { setServerToast } from '~/utils/toast.server';

export const interfacePatchAction = async (
  { request, params }: ActionFunctionArgs,
  { fetch }: { fetch: typeof fetchTyped },
) => {
  invariant(params.organizationId, 'Missing organizationId');
  invariant(params.pipelineId, 'Missing pipelineId');

  const validator = withZod(InterfaceConfig);

  const result = await validator.validate(await request.json());

  if (result.error) return validationError(result.error);

  const pipelineApi = new PipelineApi(fetch);
  const aliasId = pipelineApi.getAliasFromUrl(request.url);

  const isLatestPipeline = !aliasId || aliasId === 'latest';

  const body = {
    interface_config: result.data,
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
};
