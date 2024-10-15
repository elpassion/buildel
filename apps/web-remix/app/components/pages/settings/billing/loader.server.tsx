import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { SubscriptionsApi } from '~/api/subscriptions/SubscriptionsApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { getCurrentUser } from '~/utils/currentUser.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const subscriptionsApi = new SubscriptionsApi(fetch);

    const { user } = await getCurrentUser(request);

    const plansPromise = subscriptionsApi.getProducts(params.organizationId);
    const subscriptionPromise = subscriptionsApi.subscription(
      params.organizationId,
    );

    const [{ data: subscription }, { data: plans }] = await Promise.all([
      subscriptionPromise,
      plansPromise,
    ]);

    return json({
      user,
      plans: plans.data,
      subscription: subscription.data,
    });
  })(args);
}
