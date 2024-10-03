import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { CreateFromTemplateSchema } from '~/api/organization/organization.contracts';
import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import type { ActionFunctionHelpers } from '~/utils.server';
import { actionBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    // eslint-disable-next-line
    // @ts-ignore
    post: async ({ params, request, ...rest }, helpers) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const body = await request.clone().formData();

      if (body.get('intent') === 'TOGGLE_FAVORITE') {
        return toggleFavoriteAction({ params, request, ...rest }, helpers);
      }

      return createFromTemplateAction({ params, request, ...rest }, helpers);
    },
    // eslint-disable-next-line
    // @ts-ignore
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const pipelineId = (await request.formData()).get('pipelineId');
      invariant(pipelineId, 'Missing pipelineId');

      const pipelineApi = new PipelineApi(fetch);
      await pipelineApi.deletePipeline(
        params.organizationId,
        pipelineId.toString(),
      );

      return json(
        { pipelineId },
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Workflow deleted',
                description: `You've successfully deleted workflow`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}

async function createFromTemplateAction(
  { request, params }: ActionFunctionArgs,
  { fetch }: ActionFunctionHelpers,
) {
  invariant(params.organizationId, 'Missing organizationId');

  const validator = withZod(CreateFromTemplateSchema);

  const result = await validator.validate(await request.formData());

  if (result.error) return validationError(result.error);

  const organizationApi = new OrganizationApi(fetch);
  const {
    data: { pipeline_id },
  } = await organizationApi.createFromTemplate(
    params.organizationId,
    result.data,
  );

  return redirect(routes.pipelineBuild(params.organizationId, pipeline_id), {
    headers: {
      'Set-Cookie': await setServerToast(request, {
        success: {
          title: 'Workflow created',
          description: `You've successfully created workflow`,
        },
      }),
    },
  });
}

async function toggleFavoriteAction(
  { request, params }: ActionFunctionArgs,
  { fetch }: ActionFunctionHelpers,
) {
  invariant(params.organizationId, 'Missing organizationId');

  const validator = withZod(
    z.object({ pipelineId: z.union([z.string(), z.number()]) }),
  );

  const result = await validator.validate(await request.formData());

  if (result.error) return validationError(result.error);

  const pipelineApi = new PipelineApi(fetch);

  const { data: pipeline } = await pipelineApi.toggleFavorite(
    params.organizationId,
    result.data.pipelineId,
  );

  return json(pipeline, {
    headers: {
      'Set-Cookie': await setServerToast(request, {
        success: {
          title: 'Workflow updated',
          description: `You've successfully updated workflow`,
        },
      }),
    },
  });
}
