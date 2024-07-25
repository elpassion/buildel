import { useCallback } from 'react';
import Dagre from '@dagrejs/dagre';

import type { IEdge, INode } from '~/components/pages/pipelines/pipeline.types';

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

export type UseLayoutNodesArgs = {
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
  fitView: () => void;
};

export const useLayoutNodes = ({
  nodes,
  edges,
  setFlowData,
  fitView,
}: UseLayoutNodesArgs) => {
  const getLayoutedElements = (
    nodes: INode[],
    edges: IEdge[],
    direction?: LayoutDirection,
  ) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: direction ?? 'TR',
      nodesep: 100,
      ranksep: 100,
    });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );

    Dagre.layout(g, { rankdir: 'TR' });

    return {
      nodes: nodes.map((node) => {
        const position = g.node(node.id);

        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;

        return { ...node, position: { x, y } };
      }),
      edges,
    };
  };

  const layout = useCallback(
    (direction: LayoutDirection) => {
      const layouted = getLayoutedElements(nodes, edges, direction);

      setFlowData({ edges: [...layouted.edges], nodes: [...layouted.nodes] });

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges],
  );

  return { layout };
};
