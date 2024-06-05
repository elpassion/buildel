import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { BlockTypeApi } from "~/api/blockType/BlockTypeApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    const searchParams = new URL(request.url).searchParams;
    const blockName = searchParams.get("block_name") ?? undefined;
    const after = searchParams.get("after") ?? undefined;

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    const pipelineRunPromise = pipelineApi.getPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId
    );

    const pipelineRunLogsPromise = pipelineApi.getPipelineRunLogs(
      params.organizationId,
      params.pipelineId,
      params.runId,
      {
        block_name: blockName,
        after
      }
    );

    const [blockTypes, pipeline, pipelineRun, pipelineRunLogs] = await Promise.all([
      blockTypesPromise,
      pipelinePromise,
      pipelineRunPromise,
      pipelineRunLogsPromise,
    ]);

    const blocks = pipelineRun.data.config.blocks.map((block) => ({
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
      pipelineRun: {
        ...pipelineRun.data,
        config: { ...pipelineRun.data.config, blocks },
      },
      pipelineRunLogs: pipelineRunLogs.data,
      blockName
    });
  })(args);
}
