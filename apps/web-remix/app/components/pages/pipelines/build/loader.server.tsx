import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { EnrichedPipelineApi } from '~/api/EnrichedPipelineApi';
import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    const organizationApi = new OrganizationApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);
    const pipelineApi = new PipelineApi(fetch);
    const aliasId = pipelineApi.getAliasFromUrl(request.url);

    const enrichedPipelineApi = new EnrichedPipelineApi(
      pipelineApi,
      blockTypeApi,
    );

    const organizationPromise = organizationApi.getOrganization(
      params.organizationId,
    );

    const enrichedPipelinePromise =
      await enrichedPipelineApi.getEnrichedPipeline(
        params.organizationId,
        params.pipelineId,
        aliasId,
      );

    const [organization, { pipeline, blockTypes }] = await Promise.all([
      organizationPromise,
      enrichedPipelinePromise,
    ]);

    let elPipeline: IPipeline | undefined;

    if (organization.data.el_id) {
      const elResponse = await pipelineApi.getPipeline(
        params.organizationId,
        organization.data.el_id,
      );
      elPipeline = elResponse.data;
    }

    return json({
      pipeline: pipeline,
      elPipeline: elPipeline,
      aliasId: aliasId,
      blockTypes: blockTypes,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
      pageUrl: process.env.PAGE_URL,
      organization: organization.data,
    });
  })(args);
}
