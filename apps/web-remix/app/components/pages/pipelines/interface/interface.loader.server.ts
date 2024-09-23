import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { PipelineApi } from '~/api/pipeline/PipelineApi';
import type { fetchTyped } from '~/utils/fetch.server';

export const interfaceLoader = async (
  { request, params }: LoaderFunctionArgs,
  { fetch }: { fetch: typeof fetchTyped },
) => {
  invariant(params.organizationId, 'organizationId not found');
  invariant(params.pipelineId, 'pipelineId not found');

  const pipelineApi = new PipelineApi(fetch);
  const aliasId = pipelineApi.getAliasFromUrl(request.url);

  const pipeline = await pipelineApi.getAliasedPipeline(
    params.organizationId,
    params.pipelineId,
    aliasId,
  );

  return json({
    pipeline,
    aliasId,
    pipelineId: params.pipelineId,
    organizationId: params.organizationId,
    pageUrl: process.env['PAGE_URL'],
  });
};
