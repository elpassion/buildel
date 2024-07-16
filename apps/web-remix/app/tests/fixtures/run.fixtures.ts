import type { IPipelineRun } from '~/components/pages/pipelines/pipeline.types';
import { runCostFixture } from '~/tests/fixtures/runCost.fixtures';

export const runFixture = (override?: Partial<IPipelineRun>): IPipelineRun => {
  return {
    created_at: '2024-02-26T07:49:48',
    costs: [{ data: runCostFixture() }, { data: runCostFixture({ id: 2 }) }],
    id: 1,
    status: 'finished',
    config: {
      version: '1',
      blocks: [
        {
          name: 'text_input_1',
          opts: {
            pull: false,
          },
          inputs: [],
          connections: [],
          position: {
            x: 0,
            y: -500,
          },
          type: 'text_input',
        },
        {
          name: 'chat_1',
          opts: {
            api_key: 'open ai',
            api_type: 'openai',
            chat_memory_type: 'full',
            description: '',
            endpoint: 'https://api.openai.com/v1',
            messages: [],
            model: '',
            prompt_template: '{{text_input_1:output}}',
            system_message: 'd',
            temperature: 0.7,
          },
          inputs: ['text_input_1:output->input?reset=true'],
          connections: [
            {
              from: {
                block_name: 'text_input_1',
                output_name: 'output',
              },
              to: {
                block_name: 'chat_1',
                input_name: 'input',
              },
              opts: {
                reset: true,
              },
            },
          ],
          position: {
            x: 400,
            y: -500,
          },
          type: 'chat',
        },
        {
          name: 'text_output_1',
          opts: {
            stream_timeout: 500,
          },
          inputs: ['chat_1:output->input?reset=true'],
          connections: [
            {
              from: {
                block_name: 'chat_1',
                output_name: 'output',
              },
              to: {
                block_name: 'text_output_1',
                input_name: 'input',
              },
              opts: {
                reset: true,
              },
            },
          ],
          position: {
            x: 800,
            y: -500,
          },
          type: 'text_output',
        },
      ],
      connections: [
        {
          from: {
            block_name: 'text_input_1',
            output_name: 'output',
          },
          to: {
            block_name: 'chat_1',
            input_name: 'input',
          },
          opts: {
            reset: true,
          },
        },
        {
          from: {
            block_name: 'chat_1',
            output_name: 'output',
          },
          to: {
            block_name: 'text_output_1',
            input_name: 'input',
          },
          opts: {
            reset: true,
          },
        },
      ],
    },
    ...override,
  };
};
