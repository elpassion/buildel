import { produce } from 'immer';
import { IBlockConfig, IIO } from './pipelines.hooks';

export interface IPipelineConfig {
  blocks: IBlock[];
}

type IBlock = IBlockConfig;

export interface Connection {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface INode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: IBlock;
}

export interface IEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export function getNodes(pipeline: IPipelineConfig): INode[] {
  return pipeline.blocks.map((block) => ({
    id: block.name,
    type: block.block_type.type,
    position: { x: 0, y: 0 },
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
  _edges: IEdge[],
): IPipelineConfig {
  return {
    blocks: nodes.map((node) => node.data),
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
