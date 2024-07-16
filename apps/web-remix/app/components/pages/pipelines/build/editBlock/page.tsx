import React, { useEffect } from "react";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import type {
  IBlockConfig,
  IConfigConnection,
  INode,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import {
  getEdges,
  getNodes,
  reverseToolConnections,
  toPipelineConfig,
} from "~/components/pages/pipelines/PipelineFlow.utils";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { BlockInputList } from "./BlockInputList";
import { EditBlockForm } from "./EditBlockForm";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

type IExtendedBlockConfig = IBlockConfig & { oldName: string };

export function EditBlockPage() {
  const { organizationId, pipelineId, block, pipeline } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();

  const nodes = getNodes(pipeline.config);
  const edges = getEdges(pipeline.config);

  const closeSidebar = () => {
    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries())
      ),
      { state: { reset: true } }
    );
  };

  const handleSubmit = (
    updatedBlock: IExtendedBlockConfig,
    connections: IConfigConnection[]
  ) => {
    const updatedNodes = nodes.map((node) => updateNode(node, updatedBlock));
    const updatedConnections = connections.map((connection) =>
      updateConnection(connection, updatedBlock)
    );

    updateFetcher.submit(
      {
        ...pipeline,
        config: {
          ...toPipelineConfig(updatedNodes, edges),
          connections: updatedConnections,
        },
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
  }, [updateFetcher.data]);

  return (
    <>
      <ActionSidebarHeader
        heading={block.name}
        subheading={block.block_type?.description}
        onClose={closeSidebar}
      />

      <EditBlockForm
        onSubmit={handleSubmit}
        blockConfig={block}
        organizationId={pipeline.organization_id}
        pipelineId={pipeline.id}
        nodesNames={nodes.map((node) => node.data.name)}
        connections={pipeline.config.connections}
      >
        <BlockInputList
          connections={[
            ...pipeline.config.connections.filter(
              (connection) => connection.to.block_name === block.name
            ),
            ...reverseToolConnections(pipeline.config.connections, block.name),
          ]}
        />
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
  connection: IConfigConnection,
  updated: IExtendedBlockConfig
) {
  return {
    ...connection,
    from: updateConnectionEnd(connection.from, updated),
    to: updateConnectionEnd(connection.to, updated),
  };
}

function updateNode(node: INode, updated: IExtendedBlockConfig) {
  if (node.id === updated.oldName) {
    const { oldName, ...rest } = updated;
    node.data = rest;
    node.id = updated.name;
  }

  return node;
}
