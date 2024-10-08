import type { fetchTyped } from '~/utils/fetch.server';

import { SubscriptionProductsResponse } from './subscriptions.contracts';

export class SubscriptionsApi {
  constructor(private client: typeof fetchTyped) {}

  async getProducts(organizationId: string | number) {
    return this.client(
      SubscriptionProductsResponse,
      `/organizations/${organizationId}/subscriptions/products`,
    );
  }
}
