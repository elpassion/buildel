import cloneDeep from "lodash.clonedeep";
import { Connection } from "reactflow";
import {
  IPipelineConfig,
  INode,
  IEdge,
  IField,
  IBlockConfig,
  IHandle,
} from "../pipeline.types";

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
        type: "default",
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

export function getBlockHandles(block: IBlockConfig): IHandle[] {
  const blockType = block.block_type;
  return [
    ...blockType.inputs
      .filter((input) => !input.public)
      .map((input) => ({
        type: "target" as const,
        id: input.name,
        data: input,
      })),
    ...blockType.outputs
      .filter((output) => !output.public)
      .map((output) => ({
        type: "source" as const,
        id: output.name,
        data: output,
      })),
  ];
}

export function getBlockFields(block: IBlockConfig): IField[] {
  const blockType = block.block_type;
  return [
    ...blockType.inputs
      .filter((input) => input.public)
      .map((input) => ({
        type: "input" as const,
        data: input,
      })),
    ...blockType.outputs
      .filter((output) => output.public)
      .map((output) => ({
        type: "output" as const,
        data: output,
      })),
  ];
}

export function getAllBlockTypes(
  config: IPipelineConfig,
  type: string
): IBlockConfig[] {
  return config.blocks.filter((block) => block.type === type);
}

export function getLastBlockNumber(blocks: IBlockConfig[]) {
  const nrs = blocks
    .map((block) => block.name.split("_"))
    .map((part) => Number.parseInt(part[part.length - 1]))
    .filter((n) => !isNaN(n));

  return Math.max(...nrs, 0);
}
