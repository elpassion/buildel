import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { Connection } from 'reactflow';
import {
  IBlock,
  IEdge,
  IField,
  IHandle,
  IIO,
  INode,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';

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
      let targetHandle = 'input';
      let [source, sourceHandle] = input.split(':');
      if (sourceHandle.includes('->')) {
        [sourceHandle, targetHandle] = sourceHandle.split('->');
      }
      return {
        id: `${source}:${sourceHandle}-${block.name}:${targetHandle}`,
        source: source,
        sourceHandle: sourceHandle,
        target: block.name,
        targetHandle: targetHandle,
      };
    }),
  );
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
    sourceBlock.block_type.outputs.find(
      (output) => output.name === connection.sourceHandle,
    )?.type !==
      targetBlock.block_type.inputs.find(
        (input) => input.name === connection.targetHandle,
      )?.type
  )
    return false;
  return true;
}

export function toPipelineConfig(
  nodes: INode[],
  edges: IEdge[],
): IPipelineConfig {
  const tmpNodes = cloneDeep(nodes);

  tmpNodes.forEach((node) => {
    node.data.inputs = [];
  });

  edges.forEach((edge) => {
    const targetNode = tmpNodes.find((node) => node.id === edge.target);
    if (!targetNode) return;

    targetNode.data.inputs.push(
      `${edge.source}:${edge.sourceHandle}->${edge.targetHandle}`,
    );
  });

  return {
    blocks: tmpNodes.map((node) => ({ ...node.data, position: node.position })),
  };
}

export function getBlocks(pipeline: IPipelineConfig): IBlock[] {
  return pipeline.blocks;
}

export function connectIO(
  pipeline: IPipelineConfig,
  source: { block: IBlock; output: IIO },
  target: { block: IBlock; input: IIO },
) {
  return produce(pipeline, (draft) => {
    if (source.output.type !== target.input.type) return;
    const inputBlockIndex = draft.blocks.findIndex(
      (block) => block.name === target.block.name,
    );
    if (inputBlockIndex === -1) return;
    draft.blocks[
      inputBlockIndex
    ].opts.input = `${source.block.name}:${source.output.name}->${target.input.name}`;
  });
}

export function disconnectIO(
  pipeline: IPipelineConfig,
  _source: { block: IBlock; output: IIO },
  destination: { block: IBlock; input: IIO },
) {
  return produce(pipeline, (draft) => {
    const inputBlockIndex = draft.blocks.findIndex(
      (block) => block.name === destination.block.name,
    );
    if (inputBlockIndex === -1) return;
    delete draft.blocks[inputBlockIndex].opts.input;
  });
}

export function removeBlock(pipeline: IPipelineConfig, block: IBlock) {
  return produce(pipeline, (draft) => {
    const blockIndex = draft.blocks.findIndex((b) => b.name === block.name);
    if (blockIndex === -1) return;
    draft.blocks.splice(blockIndex, 1);
    draft.blocks
      .filter((b) => b.opts.input === `${block.name}:output`)
      .forEach((b) => {
        delete b.opts.input;
      });
  });
}

export function addBlock(pipeline: IPipelineConfig, block: IBlock) {
  return produce(pipeline, (draft) => {
    draft.blocks.push(block);
  });
}

export function updateBlock(pipeline: IPipelineConfig, block: IBlock) {
  return produce(pipeline, (draft) => {
    const blockIndex = draft.blocks.findIndex((b) => b.name === block.name);
    if (blockIndex === -1) return;
    draft.blocks[blockIndex] = block;
  });
}

export function getBlockHandles(block: IBlock): IHandle[] {
  const blockType = block.block_type;
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
  ];
}

export function getBlockFields(block: IBlock): IField[] {
  const blockType = block.block_type;
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
