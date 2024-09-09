import React from 'react';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { chatSize } from '~/components/chat/chat.types';
import { Webchat } from '~/components/chat/Webchat';
import { loaderBuilder } from '~/utils.server';
import { UnauthorizedError } from '~/utils/errors';
import type { ParsedResponse } from '~/utils/fetch.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
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
  })(args);
}

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias, chatSize } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex justify-center items-center h-screen w-full bg-secondary">
      <Webchat
        organizationId={organizationId}
        pipelineId={pipelineId}
        pipeline={pipeline}
        alias={alias}
        size={chatSize}
      />
    </div>
  );
}
