import { z } from 'zod';

export const checkoutSchema = z.object({
  priceId: z.string(),
});
