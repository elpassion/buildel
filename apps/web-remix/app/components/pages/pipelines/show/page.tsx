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
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import flowStyles from "reactflow/dist/style.css";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDebounce } from "usehooks-ts";
import { isEqual } from "lodash";
import { RunPipelineProvider } from "./RunPipelineProvider";
import type { CustomNodeProps } from "./CustomNodes/CustomNode";
import { CustomNode } from "./CustomNodes/CustomNode";
import { PipelineSidebar } from "./PipelineSidebar/PipelineSidebar";
import { useDraggableNodes } from "./PipelineSidebar/useDraggableNodes";
import type {
  IBlockConfig,
  IPipelineConfig,
  IPipeline,
  IEdge,
} from "~/components/pages/pipelines/list/contracts";
import { assert } from "./usePipelineRun";
import { PipelineNavbar } from "~/components/pages/pipelines/show/PipelineNavbar";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
];

export function ShowPipelinePage() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const fetcher = useFetcher<IPipeline>();
  const { pipeline, blockTypes } = useLoaderData<typeof loader>();
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

  const handleDelete = useCallback(
    (node: IBlockConfig) =>
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name)),
    [setNodes]
  );

  const handleUpdate = useCallback(
    (config: IPipelineConfig) => {
      fetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json", replace: true }
      );
    },
    [fetcher, pipeline]
  );

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      assert(pipeline);

      const sameBlockTypes = getAllBlockTypes(pipeline, created.type);
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${created.type.toLowerCase()}_${nameNum}`;

      handleUpdate({
        version: pipeline.config.version,
        blocks: [...pipeline.config.blocks, { ...created, name }],
      });
    },
    [pipeline, handleUpdate]
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds) as IEdge[]);
  }, []);

  const PipelineNode = useCallback(
    (props: CustomNodeProps) => (
      <CustomNode
        {...props}
        // onUpdate={handleEditBlock}
        onDelete={handleDelete}
      />
    ),
    [handleDelete]
  );

  const nodeTypes = useMemo(() => {
    return blockTypes.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.type]: PipelineNode,
      }),
      {}
    );
  }, [PipelineNode, blockTypes]);

  useEffect(() => {
    // @ts-ignore
    const config = toPipelineConfig(debouncedState.nodes, debouncedState.edges);
    if (isEqual(config, pipeline.config)) return;

    handleUpdate(config);
  }, [debouncedState]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data !== null) {
      const config = fetcher.data;
      if (!config || isEqual(config, pipeline.config)) return;

      setNodes(getNodes(config.config));
      setEdges(getEdges(config.config));
    }
  }, [fetcher]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  return (
    <>
      <PipelineNavbar name={pipeline.name} />
      <div className="h-[calc(100vh_-_65px)] w-full" ref={reactFlowWrapper}>
        <RunPipelineProvider pipeline={pipeline}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
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

          <PipelineSidebar blockTypes={blockTypes} />
        </RunPipelineProvider>
      </div>
    </>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Show pipeline",
    },
  ];
};
