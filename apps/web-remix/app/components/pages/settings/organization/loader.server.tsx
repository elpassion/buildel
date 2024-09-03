import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const organizationApi = new OrganizationApi(fetch);
    const pipelineApi = new PipelineApi(fetch);

    const pipelinesPromise = await pipelineApi.getPipelines(
      params.organizationId,
    );

    const apiKeyPromise = organizationApi.getApiKey(params.organizationId);

    const organizationPromise = organizationApi.getOrganization(
      params.organizationId,
    );

    const [apiKey, organization, pipelines] = await Promise.all([
      apiKeyPromise,
      organizationPromise,
      pipelinesPromise,
    ]);

    return json({
      apiKey: apiKey.data,
      organization: organization.data,
      organizationId: params.organizationId,
      pipelines: pipelines.data.data,
    });
  })(args);
}
