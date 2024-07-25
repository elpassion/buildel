import React from 'react';
import { ControlButton, Controls, useReactFlow } from '@xyflow/react';
import { UnfoldHorizontal, UnfoldVertical } from 'lucide-react';

import type { IEdge, INode } from '~/components/pages/pipelines/pipeline.types';
import { useLayoutNodes } from '~/components/pages/pipelines/useLayoutNodes';

interface BuilderControlsProps {
  nodes: INode[];
  edges: IEdge[];
  setFlowData: (
    cb:
      | { nodes: INode[]; edges: IEdge[] }
      | ((oldState: { nodes: INode[]; edges: IEdge[] }) => {
          nodes: INode[];
          edges: IEdge[];
        }),
  ) => void;
}

export const BuilderControls = ({
  nodes,
  edges,
  setFlowData,
}: BuilderControlsProps) => {
  const { fitView } = useReactFlow();
  const { layout } = useLayoutNodes({ nodes, edges, setFlowData, fitView });

  return (
    <Controls showInteractive={false}>
      <ControlButton onClick={() => layout('LR')}>
        <UnfoldHorizontal />
      </ControlButton>
      <ControlButton onClick={() => layout('BT')}>
        <UnfoldVertical />
      </ControlButton>
    </Controls>
  );
};
