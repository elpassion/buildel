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
  source: { block: IBlock; output: IIO },
  destination: { block: IBlock; input: IIO },
) {
  return produce(pipeline, (draft) => {
    if (source.output.type !== destination.input.type) return;
    const inputBlockIndex = draft.blocks.findIndex(
      (block) => block.name === destination.block.name,
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
