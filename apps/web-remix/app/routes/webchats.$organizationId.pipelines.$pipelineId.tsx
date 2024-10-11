import React from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import type { OnConnect } from '@buildel/buildel';
import invariant from 'tiny-invariant';

import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { chatSize } from '~/components/chat/chat.types';
import { Webchat } from '~/components/chat/Webchat';
import { loaderBuilder } from '~/utils.server';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, request }, { fetch }) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    const pipelineApi = new PipelineApi(fetch);

    const alias = pipelineApi.getAliasFromUrl(request.url);
    const searchParams = new URLSearchParams(new URL(request.url).searchParams);

    const size = chatSize.safeParse(searchParams.get('size'));

    return json({
      alias,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      chatSize: size.success ? size.data : 'default',
      isAudioChat: searchParams.get('audio') === 'true',
      runId: params.runId ? Number(params.runId) : undefined,
      authUrl: searchParams.get('authUrl') ?? '/super-api/channel_auth',
    });
  })(args);
}

export default function WebsiteChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    pipelineId,
    organizationId,
    alias,
    chatSize,
    isAudioChat,
    authUrl,
    runId,
  } = useLoaderData<typeof loader>();

  const onConnect: OnConnect = (config) => {
    navigate(
      routes.chatPreviewRun(
        organizationId,
        pipelineId,
        config.id,
        Object.fromEntries(searchParams.entries()),
      ),
      {
        replace: true,
      },
    );
  };

  return (
    <div className="flex justify-center items-center h-[100dvh] w-full bg-secondary">
      <Webchat
        defaultInterface={isAudioChat ? 'voice' : 'chat'}
        organizationId={organizationId}
        pipelineId={pipelineId}
        onConnect={onConnect}
        size={chatSize}
        runArgs={{
          alias,
          id: runId,
        }}
        socketArgs={{
          authUrl,
        }}
      />
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Webchat',
    },
  ];
});
