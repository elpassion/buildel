import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { withZod } from "@remix-validated-form/with-zod";
import { updateSchema } from "~/components/pages/pipelines/pipelineLayout/schema";
import { validationError } from "remix-validated-form";
import { PipelineResponse } from "~/components/pages/pipelines/contracts";
import {
  JSONSchemaField,
  generateZODSchema,
} from "~/components/form/schema/SchemaParser";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(updateSchema);

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

      const res = await fetch(
        PipelineResponse,
        `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pipeline: result.data,
          }),
        }
      );

      return json({});
    },
  })(actionArgs);
}
