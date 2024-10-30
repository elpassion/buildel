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
  const { layout } = useLayoutNodes({ setFlowData, fitView });

  return (
    <Controls
      showInteractive={false}
      position="bottom-right"
      className="rounded overflow-hidden !shadow-none !drop-shadow-none border border-input"
    >
      <ControlButton
        id="layout-left-right"
        onClick={() => layout({ nodes, edges }, 'LR')}
      >
        <UnfoldHorizontal />
      </ControlButton>
      <ControlButton onClick={() => layout({ nodes, edges }, 'BT')}>
        <UnfoldVertical />
      </ControlButton>
    </Controls>
  );
};
