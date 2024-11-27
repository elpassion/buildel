import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { UpdatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import {
  IBlockConfig,
  IInterfaceConfig,
  IInterfaceConfigFormProperty,
} from '~/components/pages/pipelines/pipeline.types';
import { requireLogin } from '~/session.server';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');
      invariant(params.pipelineId, 'Missing pipelineId');

      const validator = withZod(UpdatePipelineSchema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const validatedBlocks = (await Promise.all(
        result.data.config.blocks.map(async (block) => {
          const schema = generateZODSchema(
            block.block_type!.schema as JSONSchemaField,
            false,
            {
              organization_id: params.organizationId!,
              pipeline_id: params.pipelineId!,
              block_name: block.name,
            },
          );
          const validator = withZod(schema);
          const validatedBlock = await validator.validate(block);

          if (validatedBlock) {
            return validatedBlock.data;
          }
          return block;
        }),
      )) as any[];

      result.data.config.blocks = result.data.config.blocks.map((block, i) => {
        const finalBlock = {
          ...block,
          ...validatedBlocks[i],
        };
        delete finalBlock.block_type;

        return finalBlock;
      });

      result.data.interface_config = validateInterfaceConfigs(
        result.data.interface_config,
        result.data.config.blocks,
      );

      const pipelineApi = new PipelineApi(fetch);
      await pipelineApi.updatePipeline(
        params.organizationId,
        params.pipelineId,
        result.data,
      );

      return json({});
    },
  })(actionArgs);
}

function validateInterfaceConfigs(
  interfaces: IInterfaceConfig,
  blocks: IBlockConfig[],
): IInterfaceConfig {
  const validate = checkIfInterfaceBlockExist(blocks);

  return {
    ...interfaces,
    webchat: {
      ...interfaces.webchat,
      inputs: interfaces.webchat.inputs.filter(validate),
      outputs: interfaces.webchat.outputs.filter(validate),
    },
    form: {
      ...interfaces.form,
      inputs: interfaces.form.inputs.filter(validate),
      outputs: interfaces.form.outputs.filter(validate),
    },
  };
}

function checkIfInterfaceBlockExist(blocks: IBlockConfig[]) {
  return (property: IInterfaceConfigFormProperty) => {
    return blocks.some((block) => block.name === property.name);
  };
}
