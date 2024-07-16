import { json } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { UpdatePipelineSchema } from "~/api/pipeline/pipeline.contracts";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import type {
  JSONSchemaField} from "~/components/form/schema/SchemaParser";
import {
  generateZODSchema,
} from "~/components/form/schema/SchemaParser";
import { requireLogin } from "~/session.server";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

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
            }
          );
          const validator = withZod(schema);
          const validatedBlock = await validator.validate(block);

          if (validatedBlock) {
            return validatedBlock.data;
          }
          return block;
        })
      )) as any[];

      result.data.config.blocks = result.data.config.blocks.map((block, i) => {
        const finalBlock = {
          ...block,
          ...validatedBlocks[i],
        };
        delete finalBlock.block_type;

        return finalBlock;
      });

      const pipelineApi = new PipelineApi(fetch);
      await pipelineApi.updatePipeline(
        params.organizationId,
        params.pipelineId,
        result.data
      );

      return json({});
    },
  })(actionArgs);
}
