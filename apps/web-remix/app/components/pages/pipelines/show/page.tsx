import { useFetcher, useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { LinksFunction, V2_MetaFunction } from "@remix-run/node";

import flowStyles from "reactflow/dist/style.css";
import {
  getEdges,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow";
import { useCallback, useEffect, useMemo } from "react";
import { useDebounce } from "usehooks-ts";
import { action } from "./action";
import { isEqual } from "lodash";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
];

export function ShowPipelinePage() {
  const fetcher = useFetcher<typeof action>();
  const { pipeline } = useLoaderData<typeof loader>();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    getNodes(pipeline.config)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    getEdges(pipeline.config)
  );
  const state = useMemo(() => ({ nodes, edges }), [nodes, edges]);
  const debouncedState = useDebounce(state, 500);

  const handleIsValidConnection = useCallback(
    (connection: Connection) => isValidConnection(pipeline.config, connection),
    [pipeline.config]
  );

  useEffect(() => {
    // @ts-ignore
    const config = toPipelineConfig(debouncedState.nodes, debouncedState.edges);
    if (isEqual(config, pipeline.config)) return;
    fetcher.submit(
      { ...pipeline, config: { ...config } },
      { method: "PUT", encType: "application/json", replace: true }
    );
  }, [debouncedState]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        isValidConnection={handleIsValidConnection}
        fitViewOptions={{
          minZoom: 0.5,
          maxZoom: 1,
        }}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Show pipeline",
    },
  ];
};
