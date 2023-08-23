import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { Connection } from 'reactflow';
import {
  IBlock,
  IEdge,
  IHandle,
  IIO,
  INode,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';

export function getNodes(pipeline: IPipelineConfig): INode[] {
  return pipeline.blocks.map((block) => ({
    id: block.name,
    type: block.block_type.type,
    position: {
      x: 100,
      y: 100,
    },
    data: block,
  }));
}

export function getEdges(pipeline: IPipelineConfig): IEdge[] {
  return pipeline.blocks
    .filter((block) => block.opts.input)
    .map((block) => ({
      id: `${block.opts.input}-${block.name}:input`,
      source: block.opts.input.split(':')[0],
      sourceHandle: block.opts.input.split(':')[1],
      target: block.name,
      targetHandle: 'input',
    }));
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
    if (node.data.opts?.input) {
      delete node.data.opts.input;
    }
  });

  edges.forEach((edge) => {
    const targetNode = tmpNodes.find((node) => node.id === edge.target);
    if (targetNode) {
      if (!targetNode.data.opts) {
        targetNode.data.opts = {};
      }

      targetNode.data.opts.input = `${edge.source}:${edge.sourceHandle}`;
    }
  });

  return { blocks: tmpNodes.map((node) => node.data) };
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
    ].opts.input = `${source.block.name}:${source.output.name}`;
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
