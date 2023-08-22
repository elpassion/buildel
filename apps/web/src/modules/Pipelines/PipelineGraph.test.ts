import { describe, expect, test } from 'vitest';
import { IBlockConfig } from '.';
import * as PipelineGraph from './PipelineGraph';

test(PipelineGraph.getBlocks, () => {
  const pipeline: PipelineGraph.IPipelineConfig = {
    blocks: [textInputBlockConfig],
  };
  expect(PipelineGraph.getBlocks(pipeline)).toEqual([textInputBlockConfig]);
});

describe(PipelineGraph.connectIO, () => {
  test('connecting nodes of the same type works', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [textInputBlockConfig, textOutputBlockConfig],
    };
    expect(
      PipelineGraph.connectIO(
        pipeline,
        {
          block: textInputBlockConfig,
          output: textInputBlockConfig.block_type.outputs.at(0)!,
        },
        {
          block: textOutputBlockConfig,
          input: textOutputBlockConfig.block_type.inputs.at(0)!,
        },
      ),
    ).toEqual({
      blocks: [
        textInputBlockConfig,
        {
          ...textOutputBlockConfig,
          opts: { input: `${textInputBlockConfig.name}:output` },
        },
      ],
    });
  });

  test('connecting nodes of different types does not work', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [textInputBlockConfig, textOutputBlockConfig],
    };
    expect(
      PipelineGraph.connectIO(
        pipeline,
        {
          block: audioInputBlockConfig,
          output: audioInputBlockConfig.block_type.outputs.at(0)!,
        },
        {
          block: textOutputBlockConfig,
          input: textOutputBlockConfig.block_type.inputs.at(0)!,
        },
      ),
    ).toEqual(pipeline);
  });
});

describe(PipelineGraph.disconnectIO, () => {
  test('disconnecting nodes works', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [
        textInputBlockConfig,
        {
          ...textOutputBlockConfig,
          opts: { input: `${textInputBlockConfig.name}:output` },
        },
      ],
    };
    expect(
      PipelineGraph.disconnectIO(
        pipeline,
        {
          block: textInputBlockConfig,
          output: textInputBlockConfig.block_type.outputs.at(0)!,
        },
        {
          block: textOutputBlockConfig,
          input: textOutputBlockConfig.block_type.inputs.at(0)!,
        },
      ),
    ).toEqual({
      blocks: [textInputBlockConfig, textOutputBlockConfig],
    });
  });
});

describe(PipelineGraph.getNodes, () => {
  test('returns all nodes', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [
        textInputBlockConfig,
        {
          ...textOutputBlockConfig,
          opts: { input: `${textInputBlockConfig.name}:output` },
        },
      ],
    };
    expect(PipelineGraph.getNodes(pipeline)).toMatchSnapshot();
  });
});

describe(PipelineGraph.getEdges, () => {
  test('returns all edges', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [
        textInputBlockConfig,
        {
          ...textOutputBlockConfig,
          opts: { input: `${textInputBlockConfig.name}:output` },
        },
      ],
    };
    expect(PipelineGraph.getEdges(pipeline)).toMatchSnapshot();
  });
});

describe(PipelineGraph.removeBlock, () => {
  test('removes existing block', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [textInputBlockConfig],
    };
    expect(PipelineGraph.removeBlock(pipeline, textInputBlockConfig)).toEqual({
      blocks: [],
    });
  });

  test('removes inputs connected to block', () => {
    const pipeline: PipelineGraph.IPipelineConfig = {
      blocks: [
        textInputBlockConfig,
        {
          ...textOutputBlockConfig,
          opts: { input: `${textInputBlockConfig.name}:output` },
        },
      ],
    };
    expect(PipelineGraph.removeBlock(pipeline, textInputBlockConfig)).toEqual({
      blocks: [textOutputBlockConfig],
    });
  });
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

const textOutputBlockConfig: IBlockConfig = {
  opts: {},
  type: 'text_output',
  name: 'text_output',
  block_type: {
    inputs: [{ name: 'input', public: false, type: 'text' }],
    outputs: [{ name: 'output', public: true, type: 'text' }],
    schema: '',
    type: 'text_output',
  },
};

const audioInputBlockConfig: IBlockConfig = {
  opts: {},
  type: 'audio_input',
  name: 'audio_input',
  block_type: {
    inputs: [{ name: 'input', public: true, type: 'audio' }],
    outputs: [{ name: 'output', public: false, type: 'audio' }],
    schema: '',
    type: 'audio_input',
  },
};
