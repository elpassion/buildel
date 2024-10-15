import { z } from 'zod';

export const checkoutSchema = z.object({
  priceId: z.string(),
});

export const portalSchema = z.object({
  customerId: z.string(),
});
