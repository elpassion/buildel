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

export const Checkout = z.object({
  customer: z.string().nullish(),
  id: z.string().nullish(),
  url: z.string(),
});

export const CheckoutResponse = z
  .object({ data: Checkout })
  .transform((res) => ({
    data: res.data,
  }));

export const Portal = z.object({
  customer_id: z.string().nullish(),
  session_id: z.string().nullish(),
  url: z.string(),
});

export const PortalResponse = z.object({ data: Portal }).transform((res) => ({
  data: res.data,
}));

export const Subscription = z
  .object({
    customer_id: z.string(),
    end_date: z.string(),
    features: z.object({
      runs_limit: z.union([z.number(), z.string()]),
      seats_limit: z.union([z.number(), z.string()]),
      el_included: z.boolean(),
      datasets_limit: z.union([z.number(), z.string()]),
      workflows_limit: z.union([z.number(), z.string()]),
      experiments_limit: z.union([z.number(), z.string()]),
      dedicated_support: z.boolean(),
      knowledge_bases_limit: z.union([z.number(), z.string()]),
    }),
    interval: z.string(),
    status: z.string(),
    type: z.string(),
  })
  .transform((sub) => ({
    ...sub,
    features: {
      ...sub.features,
      runs_limit: Number(sub.features.runs_limit),
      seats_limit: Number(sub.features.seats_limit),
      datasets_limit: Number(sub.features.datasets_limit),
      workflows_limit: Number(sub.features.workflows_limit),
      experiments_limit: Number(sub.features.experiments_limit),
      knowledge_bases_limit: Number(sub.features.knowledge_bases_limit),
    },
  }));

export const SubscriptionResponse = z
  .object({ data: Subscription })
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
