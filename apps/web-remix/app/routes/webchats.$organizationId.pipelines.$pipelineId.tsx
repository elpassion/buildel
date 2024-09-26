import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { chatSize } from '~/components/chat/chat.types';
import {
  isAudioConfigured,
  isWebchatConfigured,
} from '~/components/chat/chat.utils';
import { Webchat } from '~/components/chat/Webchat';
import { loaderBuilder } from '~/utils.server';
import { UnauthorizedError } from '~/utils/errors';
import type { ParsedResponse } from '~/utils/fetch.server';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, request }, { fetch }) => {
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
    const searchParams = new URLSearchParams(new URL(request.url).searchParams);

    const size = chatSize.safeParse(searchParams.get('size'));
    const audio = searchParams.get('audio') === 'true';

    if (
      !isWebchatConfigured(pipeline.data) &&
      isAudioConfigured(pipeline.data) &&
      !audio
    ) {
      return redirect(
        routes.chatPreview(params.organizationId, params.pipelineId, {
          ...Object.fromEntries(searchParams.entries()),
          audio: true,
        }),
      );
    }

    const isAudioChat = audio && isAudioConfigured(pipeline.data);

    return json({
      alias,
      pipeline: pipeline.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      chatSize: size.success ? size.data : 'default',
      isAudioChat,
    });
  })(args);
}

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias, chatSize, isAudioChat } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex justify-center items-center h-[100dvh] w-full bg-secondary">
      <Webchat
        isAudioChat={isAudioChat}
        organizationId={organizationId}
        pipelineId={pipelineId}
        pipeline={pipeline}
        alias={alias}
        size={chatSize}
      />
    </div>
  );
}
