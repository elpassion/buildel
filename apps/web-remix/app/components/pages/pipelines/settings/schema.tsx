import { z } from "zod";
import { zfd } from "zod-form-data";

export const updatePipelineNameSchema = z.object({
  name: z.string().min(2),
});

export const updatePipelineBudgetLimitSchema = z.object({
  budget_limit: z.union([zfd.numeric(), z.null(), z.undefined()]),
});
