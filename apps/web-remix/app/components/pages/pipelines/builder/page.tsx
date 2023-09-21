import { V2_MetaFunction } from "@remix-run/node";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  IBlockConfig,
  IEdge,
  IPipeline,
  IPipelineConfig,
} from "../pipeline.types";
import { useModal } from "~/hooks/useModal";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import { useDebounce } from "usehooks-ts";
import { assert } from "~/utils/assert";
import { CustomNode, CustomNodeProps } from "./CustomNodes/CustomNode";
import isEqual from "lodash.isequal";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { EditBlockForm } from "./EditBlockForm";
import { PipelineSidebar, PipelineSidebarHeader } from "./PipelineSidebar";
import { loader } from "./loader";
import { CreateBlockList } from "./CreateBlockList";
import { BuilderHeader } from "~/components/pages/pipelines/builder/BuilderHeader";
import { Button } from "@elpassion/taco";
import { BlockInputList } from "~/components/pages/pipelines/builder/BlockInputList";

export function PipelineBuilder() {
  const { pipeline, blockTypes } = useLoaderData<typeof loader>();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const updateFetcher = useFetcher<IPipeline>();
  const {
    isModalOpen: isSidebarOpen,
    openModal: openSidebar,
    closeModal: closeSidebar,
  } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);
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

  const handleEditBlock = useCallback(
    (block: IBlockConfig) => {
      setEditableBlock(block);
      openSidebar();
    },
    [openSidebar]
  );

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeSidebar();
  }, [closeSidebar]);

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
  }, [PipelineNode, blockTypes.length]);

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
    <div
      className="relative py-5 h-[calc(100vh_-_100px)] w-full"
      ref={reactFlowWrapper}
    >
      <RunPipelineProvider pipeline={pipeline}>
        <ReactFlowProvider>
          <BuilderHeader updateStatus={updateFetcher.state} />

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
            <Background
              variant={BackgroundVariant.Dots}
              gap={25}
              color="#fff"
              className="bg-black rounded-lg"
            />
            <Controls />
          </ReactFlow>

          <PipelineSidebar
            isOpen={!!editableBlock || isSidebarOpen}
            onClose={handleCloseModal}
          >
            {editableBlock ? (
              <>
                <PipelineSidebarHeader
                  heading={editableBlock.type}
                  subheading="Open AI’s Large Language Model chat block."
                  onClose={handleCloseModal}
                />
                <EditBlockForm
                  onSubmit={onBlockUpdate}
                  blockConfig={editableBlock}
                >
                  <BlockInputList inputs={editableBlock.inputs} />
                </EditBlockForm>
              </>
            ) : (
              <>
                <PipelineSidebarHeader
                  heading="Add a new block"
                  onClose={handleCloseModal}
                />
                <CreateBlockList
                  blockTypes={blockTypes}
                  onCreate={onBlockCreate}
                />
              </>
            )}
          </PipelineSidebar>
        </ReactFlowProvider>
      </RunPipelineProvider>
      <Button
        size="xs"
        className="!absolute bottom-10 right-4"
        onClick={openSidebar}
      >
        Create block
      </Button>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Builder",
    },
  ];
};
