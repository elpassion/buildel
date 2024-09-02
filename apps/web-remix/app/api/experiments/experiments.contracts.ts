import { z } from 'zod';

import { PaginationMeta } from '~/components/pagination/pagination.types';

export const Experiment = z.object({
  id: z.union([z.number(), z.string()]),
  runs_count: z.number().default(0),
  dataset: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }),
  pipeline: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }),
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

export const ExperimentRunColumns = z.object({
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export const ExperimentRun = z.object({
  id: z.union([z.number(), z.string()]),
  created_at: z.string(),
  runs_count: z.number().default(0),
  status: z.enum(['running', 'finished', 'created']),
  columns: ExperimentRunColumns,
  columns_avg: z.record(z.string(), z.number()),
  evaluations_avg: z.number().nullable().optional(),
  total_cost: z.union([z.string(), z.string()]).nullable().optional(),
});

export const ExperimentRunResponse = z.object({
  data: ExperimentRun,
});

export const ExperimentRunsResponse = z
  .object({
    data: z.array(ExperimentRun),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));

export const ExperimentRunRun = z.object({
  id: z.union([z.number(), z.string()]),
  created_at: z.string(),
  status: z.enum(['running', 'finished', 'created']),
  data: z.record(z.string(), z.union([z.string(), z.number()])),
  run_id: z.union([z.number(), z.string()]),
  pipeline_id: z.union([z.number(), z.string()]).default(0),
  experiment_run_id: z.union([z.number(), z.string()]),
  dataset_id: z.union([z.number(), z.string()]).default(0),
  dataset_row_id: z.union([z.number(), z.string()]),
  evaluation_avg: z.number().nullable().optional(),
});

export const ExperimentRunRunsResponse = z
  .object({
    data: z.array(ExperimentRunRun),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));
