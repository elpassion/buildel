import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Voicechat } from '~/components/chat/voice/Voicechat';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias } =
    useLoaderData<typeof loader>();

  return (
    <Voicechat
      pipeline={pipeline}
      pipelineId={pipelineId}
      organizationId={organizationId}
      alias={alias}
    />
  );
}
