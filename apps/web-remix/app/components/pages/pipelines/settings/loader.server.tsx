import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { BlockTypeApi } from "~/api/blockType/BlockTypeApi";
import {
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
} from "~/components/pages/pipelines/MonthPicker/monthPicker.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    const blockTypeApi = new BlockTypeApi(fetch);
    const pipelineApi = new PipelineApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    const detailsPromise = pipelineApi.getPipelineDetails(
      params.organizationId,
      params.pipelineId,
      { start_date: DEFAULT_START_DATE, end_date: DEFAULT_END_DATE }
    );

    const [pipeline, blockTypes, { data: details }] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
      detailsPromise,
    ]);

    const blocks = pipeline.data.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    return json({
      pipeline: {
        ...pipeline.data,
        config: { ...pipeline.data.config, blocks },
      },
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      details,
    });
  })(args);
}
