import type { Connection } from '@xyflow/react';

import type {
  IBlockConfig,
  IConfigConnection,
  IEdge,
  IField,
  IHandle,
  INode,
  IPipelineConfig,
} from './pipeline.types';

export function getNodes(pipeline: IPipelineConfig): INode[] {
  return pipeline.blocks.map((block) => ({
    id: block.name,
    type: getNodeType(block.type),
    position: block.position ?? {
      x: 100,
      y: 100,
    },
    selected: false,
    data: block,
    measured: block.measured,
  }));
}

export function getEdges(pipeline: IPipelineConfig): IEdge[] {
  return pipeline.connections.map((connection) => {
    return {
      id: `${connection.from.block_name}:${connection.from.output_name}-${connection.to.block_name}:${connection.to.input_name}`,
      source: connection.from.block_name,
      sourceHandle: connection.from.output_name,
      target: connection.to.block_name,
      targetHandle: connection.to.input_name,
      type: 'default',
      data: connection,
    };
  });
}

export function isValidConnection(
  pipeline: IPipelineConfig,
  connection: Connection,
) {
  const sourceBlock = pipeline.blocks.find(
    (block) => block.name === connection.source,
  );
  const targetBlock = pipeline.blocks.find(
    (block) => block.name === connection.target,
  );

  if (
    !sourceBlock ||
    !targetBlock ||
    sourceBlock.block_type?.outputs.find(
      (output) => output.name === connection.sourceHandle,
    )?.type !==
      targetBlock.block_type?.inputs.find(
        (input) => input.name === connection.targetHandle,
      )?.type ||
    sourceBlock.name === targetBlock.name
  ) {
    return false;
  }

  return true;
}

export function toPipelineConfig(
  nodes: INode[],
  edges: IEdge[],
): IPipelineConfig {
  return {
    blocks: nodes.map((node) => ({
      ...node.data,
      position: node.position,
      measured: node.measured,
    })),
    version: '1',
    connections: edges.map((edge) => {
      return {
        from: {
          block_name: edge.source,
          output_name: edge.sourceHandle!,
        },
        to: {
          block_name: edge.target,
          input_name: edge.targetHandle!,
        },
        opts: {
          reset: edge.data?.opts?.reset ?? true,
        },
      };
    }),
  };
}

export function getBlockHandles(block: IBlockConfig): IHandle[] {
  const blockType = block.block_type;
  if (!blockType) return [];
  return [
    ...blockType.inputs
      .filter((input) => !input.public)
      .map((input) => ({
        type: 'target' as const,
        id: input.name,
        data: input,
      })),
    ...blockType.outputs
      .filter((output) => !output.public)
      .map((output) => ({
        type: 'source' as const,
        id: output.name,
        data: output,
      })),
    ...blockType.ios
      .filter((output) => !output.public)
      .filter((output) => output.type === 'worker')
      .map((output) => ({
        type: 'source' as const,
        id: output.name,
        data: output,
      })),
    ...blockType.ios
      .filter((output) => !output.public)
      .filter((output) => output.type === 'controller')
      .map((output) => ({
        type: 'target' as const,
        id: output.name,
        data: output,
      })),
  ];
}

export function getBlockFields(block: IBlockConfig): IField[] {
  const blockType = block.block_type;
  if (!blockType) return [];
  return [
    ...blockType.inputs
      .filter((input) => input.public)
      .map((input) => ({
        type: 'input' as const,
        data: input,
      })),
    ...blockType.outputs
      .filter((output) => output.public)
      .map((output) => ({
        type: 'output' as const,
        data: output,
      })),
  ];
}

export function getAllBlockTypes(
  config: IPipelineConfig,
  type: string,
): IBlockConfig[] {
  return config.blocks.filter((block) => block.type === type);
}

export function getLastBlockNumber(blocks: IBlockConfig[]) {
  const nrs = blocks
    .map((block) => block.name.split('_'))
    .map((part) => Number.parseInt(part[part.length - 1]))
    .filter((n) => !isNaN(n));

  return Math.max(...nrs, 0);
}

export function reverseToolConnections(
  connections: IConfigConnection[],
  blockName: string,
) {
  return connections
    .filter(
      (connection) =>
        connection.from.block_name === blockName &&
        connection.to.input_name === 'tool',
    )
    .map(reverseConnection);
}

function reverseConnection(connection: IConfigConnection) {
  return {
    ...connection,
    to: {
      ...connection.to,
      block_name: connection.from.block_name,
      input_name: connection.from.output_name,
    },
    from: {
      ...connection.from,
      block_name: connection.to.block_name,
      output_name: connection.to.input_name,
    },
  };
}

export function getNodeType(blockType: string) {
  if (blockType === 'comment') return 'comment';
  return 'custom';
}
