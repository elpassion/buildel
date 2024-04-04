import { z } from "zod";

export const StopRunSchema = z.object({
  runId: z.string(),
});
