import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  CreateAliasSchema,
  UpdateAliasSchema,
} from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.pipelineId, 'Missing pipelineId');

      const validator = withZod(CreateAliasSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);

      const alias = await pipelineApi.createAlias(
        params.organizationId,
        params.pipelineId,
        result.data,
      );

      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId, {
          alias: alias.data.id,
        }),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Alias created',
                description: `You've successfully created workflow alias`,
              },
            }),
          },
        },
      );
    },
    patch: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.pipelineId, 'Missing pipelineId');

      const validator = withZod(UpdateAliasSchema);

      const result = await validator.validate(await request.formData());

      invariant(result.data?.id, 'Missing alias id');

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);

      const { id, ...data } = result.data;

      await pipelineApi.updateAlias(
        params.organizationId,
        params.pipelineId,
        id,
        data,
      );

      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId, {
          alias: id,
        }),
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Alias updated',
                description: `You've successfully updated workflow alias name`,
              },
            }),
          },
        },
      );
    },
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.pipelineId, 'Missing pipelineId');

      const validator = withZod(z.object({ id: z.number() }));

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);

      await pipelineApi.deleteAlias(
        params.organizationId,
        params.pipelineId,
        result.data.id,
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Alias deleted',
                description: `You've successfully deleted workflow alias`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
