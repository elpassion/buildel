import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { ReadonlyCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/ReadonlyCommentNode';
import { ReadonlyCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/ReadonlyCustomNode';
import { metaWithDefaults } from '~/utils/metadata';

import { Builder } from '../Builder';
import { CustomEdge } from '../Edges/CustomEdges/CustomEdge';
import type { loader } from './loader.server';

export function PipelineRunOverview() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  return (
    <>
      <Builder
        type="readOnly"
        className="h-[calc(100vh_-_64px)] pt-0"
        pipeline={{ ...pipeline, config: pipelineRun.config }}
        CustomNodes={{
          custom: ReadonlyCustomNode,
          comment: ReadonlyCommentNode,
        }}
        CustomEdges={{ default: CustomEdge }}
      />

      <Outlet />
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: `Run overview`,
    },
  ];
});
