import React, { useEffect } from "react";
import { MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import {
  getEdges,
  getNodes,
  toPipelineConfig,
} from "~/components/pages/pipelines/PipelineFlow.utils";
import {
  IBlockConfig,
  IBlockConfigConnection,
  IEdge,
  INode,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import { EditBlockForm } from "./EditBlockForm";
import { BlockInputList } from "./BlockInputList";
import { loader } from "./loader";

type IExtendedBlockConfig = IBlockConfig & { oldName: string };

export function OpenAIApiPage() {
  const { organizationId, pipelineId, block, pipeline } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const updateFetcher = useFetcher<IPipeline>();

  const nodes = getNodes(pipeline.config);
  const edges = getEdges(pipeline.config);

  const closeSidebar = () => {
    navigate(routes.pipelineBuild(organizationId, pipelineId));
  };

  const handleSubmit = (updated: IExtendedBlockConfig) => {
    const updatedNodes = nodes.map((node) => updateNode(node, updated));
    const updatedEdges = edges.map((edge) => updateEdge(edge, updated));

    updateFetcher.submit(
      {
        ...pipeline,
        config: { ...toPipelineConfig(updatedNodes, updatedEdges) },
      },
      {
        method: "PUT",
        encType: "application/json",
        action: routes.pipelineBuild(pipeline.organization_id, pipeline.id),
      }
    );
  };

  useEffect(() => {
    if (updateFetcher.data) {
      closeSidebar();
    }
  }, [updateFetcher]);

  return (
    <>
      <ActionSidebarHeader
        heading={block.name}
        subheading={block.block_type.description}
        onClose={closeSidebar}
      />

      <EditBlockForm
        onSubmit={handleSubmit}
        blockConfig={block}
        organizationId={pipeline.organization_id}
        pipelineId={pipeline.id}
        nodesNames={nodes.map((node) => node.data.name)}
      >
        <BlockInputList inputs={block.inputs} />
      </EditBlockForm>
    </>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Block",
    },
  ];
};

function updateConnectionEnd<T>(
  end: { block_name: string } & T,
  updated: IExtendedBlockConfig
) {
  return {
    ...end,
    block_name:
      end.block_name === updated.oldName ? updated.name : end.block_name,
  };
}

function updateConnection(
  connection: IBlockConfigConnection,
  updated: IExtendedBlockConfig
) {
  return {
    ...connection,
    from: updateConnectionEnd(connection.from, updated),
    to: updateConnectionEnd(connection.to, updated),
  };
}

function updateInput(input: string, updated: IExtendedBlockConfig) {
  const parts = input.split(":");
  return parts[0] === updated.oldName ? `${updated.name}:${parts[1]}` : input;
}

function updateEdge(edge: IEdge, updated: IExtendedBlockConfig) {
  const updatedEdge = { ...edge };

  if (edge.source === updated.oldName) {
    updatedEdge.source = updated.name;
  }
  if (edge.target === updated.oldName) {
    updatedEdge.target = updated.name;
  }

  return {
    ...updatedEdge,
    id: `${updatedEdge.source}:${updatedEdge.sourceHandle}-${updatedEdge.target}:${updatedEdge.targetHandle}`,
  };
}

function updateNode(node: INode, updated: IExtendedBlockConfig) {
  if (node.id === updated.oldName) {
    const { oldName, ...rest } = updated;
    node.data = rest;
    node.id = updated.name;
  }

  node.data.connections = node.data.connections.map((connection) =>
    updateConnection(connection, updated)
  );
  node.data.inputs = node.data.inputs.map((input) =>
    updateInput(input, updated)
  );
  return node;
}
