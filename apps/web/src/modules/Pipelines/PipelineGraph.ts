import { IBlockConfig, IIO } from './pipelines.hooks';

export interface IPipelineConfig {
  blocks: IBlock[];
}

type IBlock = IBlockConfig;

export function getBlocks(pipeline: IPipelineConfig): IBlock[] {
  return pipeline.blocks;
}

export function connectIO(pipeline: IPipelineConfig, output: IIO, input: IIO) {
  return pipeline;
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
