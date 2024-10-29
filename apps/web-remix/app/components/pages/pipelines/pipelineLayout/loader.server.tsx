import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { SubscriptionsApi } from '~/api/subscriptions/SubscriptionsApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { getServerToast } from '~/utils/toast.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    const pipelineApi = new PipelineApi(fetch);
    const aliasId = pipelineApi.getAliasFromUrl(request.url);
    const blockTypeApi = new BlockTypeApi(fetch);
    const subscriptionsApi = new SubscriptionsApi(fetch);

    const subscriptionPromise = subscriptionsApi.subscription(
      params.organizationId,
    );
    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const aliasesPromise = pipelineApi.getAliases(
      params.organizationId,
      params.pipelineId,
    );

    const pipelinePromise = pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId,
    );

    const [pipeline, aliases, blockTypes, subscription] = await Promise.all([
      pipelinePromise,
      aliasesPromise,
      blockTypesPromise,
      subscriptionPromise,
    ]);

    const blocks = pipeline.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type,
      ),
    }));

    const { cookie, ...toasts } = await getServerToast(request);

    return json(
      {
        toasts,
        aliasId,
        subscription: subscription.data.data,
        pipeline: {
          ...pipeline,
          config: { ...pipeline.config, blocks },
        },
        aliases: aliases.data,
        organizationId: params.organizationId,
        pipelineId: params.pipelineId,
      },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      },
    );
  })(args);
}
