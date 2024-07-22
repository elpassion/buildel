import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Builder } from '../Builder';
import { CustomEdge } from '../CustomEdges/CustomEdge';
import type { loader } from './loader.server';
import { ReadOnlyNode } from './ReadOnlyNode';

export function PipelineRunOverview() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  return (
    <Builder
      type="readOnly"
      className="h-[calc(100vh_-_64px)] pt-0"
      pipeline={{ ...pipeline, config: pipelineRun.config }}
      CustomNode={ReadOnlyNode}
      CustomEdge={CustomEdge}
    />
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run overview`,
    },
  ];
};
