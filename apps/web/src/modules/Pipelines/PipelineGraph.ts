import { produce } from 'immer';
import { IBlockConfig, IIO } from './pipelines.hooks';

export interface IPipelineConfig {
  blocks: IBlock[];
}

type IBlock = IBlockConfig;

export function getBlocks(pipeline: IPipelineConfig): IBlock[] {
  return pipeline.blocks;
}

export function connectIO(
  pipeline: IPipelineConfig,
  output: { block: IBlock; output: IIO },
  input: { block: IBlock; input: IIO },
) {
  return produce(pipeline, (draft) => {
    if (output.output.type !== input.input.type) return;

    const inputBlockIndex = draft.blocks.findIndex(
      (block) => block.name === input.block.name,
    );
    draft.blocks[
      inputBlockIndex
    ].opts.input = `${output.block.name}:${output.output.name}`;
  });
}

export function disconnectIO(
  pipeline: IPipelineConfig,
  output: IIO,
  input: IIO,
) {
  return pipeline;
}

export function getBlockInputs(pipeline: IPipelineConfig, block: IBlock) {
  return [];
}

export function getBlockOutputs(pipeline: IPipelineConfig, block: IBlock) {
  return [];
}

export function removeBlock(pipeline: IPipelineConfig, block: IBlock) {
  return pipeline;
}

export function addBlock(pipeline: IPipelineConfig, block: IBlock) {
  return pipeline;
}

export function updateBlock(pipeline: IPipelineConfig, block: IBlock) {
  return pipeline;
}
