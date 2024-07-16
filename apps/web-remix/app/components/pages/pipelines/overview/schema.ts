import { z } from 'zod';

export const StopRunSchema = z.object({
  runId: z.string(),
});

export const DateFilterSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});
