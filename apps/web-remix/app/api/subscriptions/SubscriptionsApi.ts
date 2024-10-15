import type { fetchTyped } from '~/utils/fetch.server';

import {
  CheckoutResponse,
  PortalResponse,
  SubscriptionProductsResponse,
  SubscriptionResponse,
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

  async subscription(organizationId: string | number) {
    return this.client(
      SubscriptionResponse,
      `/organizations/${organizationId}/subscriptions`,
    );
  }

  async portal(organizationId: string | number, data: { customer_id: string }) {
    return this.client(
      PortalResponse,
      `/organizations/${organizationId}/subscriptions/portal`,
      { method: 'post', body: JSON.stringify(data) },
    );
  }
}
