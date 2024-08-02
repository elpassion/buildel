import { z } from 'zod';

export const Experiment = z.object({
  id: z.union([z.number(), z.string()]),
  dataset_id: z.union([z.number(), z.string()]),
  pipeline_id: z.union([z.number(), z.string()]),
  created_at: z.string(),
  name: z.string(),
});

export const ExperimentsResponse = z
  .object({
    data: z.array(Experiment),
  })
  .transform((res) => ({ data: res.data }));

export const ExperimentResponse = z
  .object({ data: Experiment })
  .transform((res) => ({ data: res.data }));

export const CreateExperimentSchema = z.object({
  dataset_id: z.union([z.number(), z.string().min(1, 'Dataset is required')]),
  pipeline_id: z.union([z.number(), z.string().min(1, 'Pipeline is required')]),
  name: z.string().min(2),
});
