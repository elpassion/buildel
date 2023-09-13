import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { isEqual } from "lodash";
import { Button } from "@elpassion/taco";
import { useDebounce } from "usehooks-ts";
import { useModal } from "~/hooks/useModal";
import { EditBlockForm } from "~/components/pages/pipelines/show/EditBlockForm";
import { assert } from "~/utils/assert";
import type {
  IBlockConfig,
  IPipelineConfig,
  IPipeline,
  IEdge,
} from "~/components/pages/pipelines/list/contracts";
import { RunPipelineProvider } from "./RunPipelineProvider";
import type { CustomNodeProps } from "./CustomNodes/CustomNode";
import { CustomNode } from "./CustomNodes/CustomNode";
import { PipelineSidebar } from "./PipelineSidebar/PipelineSidebar";
import { useDraggableNodes } from "./PipelineSidebar/useDraggableNodes";
import { PipelineNavbar } from "./PipelineNavbar";
import { RunPipelineButton } from "./RunPipelineButton";
import { loader } from "./loader";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import { BlockModal, BlockModalHeader } from "./BlockModal";
import { BlockInputList } from "./BlockInputList";
import flowStyles from "reactflow/dist/style.css";
import editorStyles from "~/components/editor/editor.styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];

export function ShowPipelinePage() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const updateFetcher = useFetcher<IPipeline>();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);
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

  const handleEditBlock = useCallback((block: IBlockConfig) => {
    setEditableBlock(block);
    openModal();
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeModal();
  }, []);

  const handleUpdate = useCallback(
    (config: IPipelineConfig) => {
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json", replace: true }
      );
    },
    [updateFetcher, pipeline]
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

  const onBlockUpdate = useCallback(
    (updated: IBlockConfig) => {
      setNodes((prev) => {
        return prev.map((node) => {
          if (node.id === updated.name) {
            node.data = updated;
          }
          return node;
        });
      });
      handleCloseModal();
    },
    [setNodes]
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds) as IEdge[]);
  }, []);

  const PipelineNode = useCallback(
    (props: CustomNodeProps) => (
      <CustomNode
        {...props}
        onUpdate={handleEditBlock}
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
    if (updateFetcher.state === "idle" && updateFetcher.data !== null) {
      const config = updateFetcher.data;
      if (!config || isEqual(config, pipeline.config)) return;

      setNodes(getNodes(config.config));
      setEdges(getEdges(config.config));
    }
  }, [updateFetcher]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });
  return (
    <>
      <PipelineNavbar name={pipeline.name} />
      <div
        className="relative h-[calc(100vh_-_65px)] w-full"
        ref={reactFlowWrapper}
      >
        <RunPipelineProvider pipeline={pipeline}>
          <header className="absolute top-2 left-4 right-4 z-10 flex justify-between">
            <RunPipelineButton />
            <Button variant="filled" size="sm" disabled>
              {updateFetcher.state === "submitting" ? "Saving" : "Up-to-date"}
            </Button>
            <BlockModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              header={
                <BlockModalHeader
                  heading={editableBlock ? "Edit Block" : "Add Block"}
                  description="Blocks are modules within your app that can work simultaneously."
                />
              }
            >
              {editableBlock && (
                <>
                  <EditBlockForm
                    onSubmit={onBlockUpdate}
                    blockConfig={editableBlock}
                  />
                  <BlockInputList inputs={editableBlock.inputs} />
                </>
              )}
            </BlockModal>
          </header>

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
