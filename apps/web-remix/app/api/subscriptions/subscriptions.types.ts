import { z } from 'zod';

import { SubscriptionProduct } from './subscriptions.contracts';

export type ISubscriptionProduct = z.TypeOf<typeof SubscriptionProduct>;
