import { expect, test } from 'vitest';
import * as PipelineGraph from './PipelineGraph';
import { IBlockConfig, IIO } from '.';

test(PipelineGraph.getBlocks, () => {
  const pipeline: PipelineGraph.IPipelineConfig = {
    blocks: [textInputBlockConfig],
  };
  expect(PipelineGraph.getBlocks(pipeline)).toEqual([textInputBlockConfig]);
});

const textInputBlockConfig: IBlockConfig = {
  opts: {},
  type: 'text_input',
  name: 'text_input',
  block_type: {
    inputs: [{ name: 'input', public: true, type: 'text' }],
    outputs: [{ name: 'output', public: false, type: 'text' }],
    schema: '',
    type: 'text_input',
  },
};
