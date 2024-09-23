import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { chatSize } from '~/components/chat/chat.types';
import { UnauthorizedError } from '~/utils/errors';
import type { fetchTyped } from '~/utils/fetch.server';
import { ParsedResponse } from '~/utils/fetch.server';

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

export const publicInterfaceLoader = async (
  { request, params }: LoaderFunctionArgs,
  { fetch }: { fetch: typeof fetchTyped },
) => {
  invariant(params.organizationId, 'organizationId not found');
  invariant(params.pipelineId, 'pipelineId not found');

  const pipelineApi = new PipelineApi(fetch);

  let pipeline: ParsedResponse<IPipelinePublicResponse> | void =
    await pipelineApi
      .getPipeline(params.organizationId, params.pipelineId)
      .catch((e) => {
        if (e instanceof UnauthorizedError) return;
        throw e;
      });
  if (!pipeline) {
    pipeline = await pipelineApi.getPublicPipeline(
      params.organizationId,
      params.pipelineId,
    );
  }

  const alias = pipelineApi.getAliasFromUrl(request.url);
  const searchParams = new URLSearchParams(request.url);

  const size = chatSize.safeParse(searchParams.get('size'));

  return json({
    pipeline: pipeline.data,
    organizationId: params.organizationId as string,
    pipelineId: params.pipelineId as string,
    chatSize: size.success ? size.data : 'default',
    alias,
  });
};
