import type { z } from 'zod';

import type {
  Subscription,
  SubscriptionFeature,
  SubscriptionPrice,
  SubscriptionProduct,
} from './subscriptions.contracts';

export type ISubscriptionProduct = z.TypeOf<typeof SubscriptionProduct>;

export type ISubscriptionFeature = z.TypeOf<typeof SubscriptionFeature>;

export type ISubscriptionPrice = z.TypeOf<typeof SubscriptionPrice>;

export type ISubscription = z.TypeOf<typeof Subscription>;
