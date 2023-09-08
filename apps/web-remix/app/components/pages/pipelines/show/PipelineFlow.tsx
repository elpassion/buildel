import { cloneDeep } from "lodash";
import { Connection } from "reactflow";
import { IPipelineConfig, INode, IEdge } from "../list/contracts";

export function getNodes(pipeline: IPipelineConfig): INode[] {
  return pipeline.blocks.map((block) => ({
    id: block.name,
    type: block.block_type.type,
    position: block.position ?? {
      x: 100,
      y: 100,
    },
    data: block,
  }));
}

export function getEdges(pipeline: IPipelineConfig): IEdge[] {
  return pipeline.blocks.flatMap((block) =>
    block.inputs.map((input) => {
      let targetHandle = "input";
      let [source, sourceHandle] = input.split(":");
      if (sourceHandle.includes("->")) {
        [sourceHandle, targetHandle] = sourceHandle.split("->");
      }
      return {
        id: `${source}:${sourceHandle}-${block.name}:${targetHandle}`,
        source: source,
        sourceHandle: sourceHandle,
        target: block.name,
        targetHandle: targetHandle,
      };
    })
  );
}

export function isValidConnection(
  pipeline: IPipelineConfig,
  connection: Connection
) {
  const sourceBlock = pipeline.blocks.find(
    (block) => block.name === connection.source
  );
  const targetBlock = pipeline.blocks.find(
    (block) => block.name === connection.target
  );

  if (
    !sourceBlock ||
    !targetBlock ||
    sourceBlock.block_type.outputs.find(
      (output) => output.name === connection.sourceHandle
    )?.type !==
      targetBlock.block_type.inputs.find(
        (input) => input.name === connection.targetHandle
      )?.type
  )
    return false;
  return true;
}

export function toPipelineConfig(
  nodes: INode[],
  edges: IEdge[]
): IPipelineConfig {
  const tmpNodes = cloneDeep(nodes);

  tmpNodes.forEach((node) => {
    node.data.inputs = [];
  });

  edges.forEach((edge) => {
    const targetNode = tmpNodes.find((node) => node.id === edge.target);
    if (!targetNode) return;

    targetNode.data.inputs.push(
      `${edge.source}:${edge.sourceHandle}->${edge.targetHandle}`
    );
  });

  return {
    blocks: tmpNodes.map((node) => ({ ...node.data, position: node.position })),
    version: "1",
  };
}
