import { z } from 'zod';

export const SubscriptionProduct = z.object({
  active: z.boolean(),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
    id: z.string(),
  }),
});

export const SubscriptionProductsResponse = z
  .object({ data: z.array(SubscriptionProduct) })
  .transform((res) => ({ data: res.data }));
