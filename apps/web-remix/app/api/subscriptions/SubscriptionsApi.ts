import type { fetchTyped } from '~/utils/fetch.server';

import {
  CheckoutResponse,
  SubscriptionProductsResponse,
} from './subscriptions.contracts';

export class SubscriptionsApi {
  constructor(private client: typeof fetchTyped) {}

  async getProducts(organizationId: string | number) {
    return this.client(
      SubscriptionProductsResponse,
      `/organizations/${organizationId}/subscriptions/products`,
    );
  }

  async checkout(organizationId: string | number, data: { price_id: string }) {
    return this.client(
      CheckoutResponse,
      `/organizations/${organizationId}/subscriptions/checkout`,
      { method: 'post', body: JSON.stringify(data) },
    );
  }
}
