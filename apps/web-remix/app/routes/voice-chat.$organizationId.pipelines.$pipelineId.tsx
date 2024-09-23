import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

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
  const { pipelineId, organizationId, pipeline, alias, chatSize } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex justify-center items-center h-[100dvh] w-full bg-secondary">
      VOICE CHAT
      {/*<Webchat*/}
      {/*  organizationId={organizationId}*/}
      {/*  pipelineId={pipelineId}*/}
      {/*  pipeline={pipeline}*/}
      {/*  alias={alias}*/}
      {/*  size={chatSize}*/}
      {/*/>*/}
    </div>
  );
}
