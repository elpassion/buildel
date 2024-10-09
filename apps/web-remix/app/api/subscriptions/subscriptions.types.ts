import type { z } from 'zod';

import type {
  SubscriptionFeature,
  SubscriptionPrice,
  SubscriptionProduct,
} from './subscriptions.contracts';

export type ISubscriptionProduct = z.TypeOf<typeof SubscriptionProduct>;

export type ISubscriptionFeature = z.TypeOf<typeof SubscriptionFeature>;

export type ISubscriptionPrice = z.TypeOf<typeof SubscriptionPrice>;
