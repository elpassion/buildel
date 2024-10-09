import { z } from 'zod';

import { MonetaryValue } from '~/utils/MonetaryValue';

export const SubscriptionPriceRecurring = z.object({
  interval: z.any(),
});

export const SubscriptionPrice = z.object({
  amount: z.number(),
  currency: z.string(),
  id: z.string(),
  recurring: SubscriptionPriceRecurring.nullable(),
});

export const SubscriptionFeature = z.object({
  name: z.string(),
});

export const SubscriptionMetadata = z.object({
  recommended: z.boolean(),
});

export const SubscriptionProduct = z.object({
  active: z.boolean(),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  prices: z.array(SubscriptionPrice),
  features: z.array(SubscriptionFeature),
  metadata: SubscriptionMetadata,
});

export const SubscriptionProductsResponse = z
  .object({ data: z.array(SubscriptionProduct) })
  .transform((res) => ({
    data: res.data,
  }));

export class StripePrice extends MonetaryValue {
  private readonly _id: string;
  constructor(price: z.TypeOf<typeof SubscriptionPrice>) {
    super(price.amount / 100, price.currency);

    this._id = price.id;
  }

  get id() {
    return this._id;
  }
}

export function stripePrice(price: z.TypeOf<typeof SubscriptionPrice>) {
  return new StripePrice(price);
}
