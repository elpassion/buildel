import { z } from 'zod';

import {
  SubscriptionFeature,
  SubscriptionProduct,
} from './subscriptions.contracts';

export type ISubscriptionProduct = z.TypeOf<typeof SubscriptionProduct>;

export type ISubscriptionFeature = z.TypeOf<typeof SubscriptionFeature>;
