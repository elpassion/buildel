import { z } from "zod";
import { zfd } from "zod-form-data";

export const updatePipelineNameSchema = z.object({
  name: z.string().min(2),
});

export const updatePipelineSettingsSchema = z.object({
  budget_limit: z.union([zfd.numeric(), z.null(), z.undefined()]),
  logs_enabled: z.union([
    zfd.checkbox(),
    z.boolean(),
    z.string().transform((val) => val === "true"),
  ]),
});

export type UpdatePipelineSettingsSchema = z.TypeOf<
  typeof updatePipelineSettingsSchema
>;
