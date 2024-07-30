import { z } from 'zod';

import { PaginationMeta } from '~/components/pagination/pagination.types';

export const Dataset = z.object({
  id: z.union([z.number(), z.string()]),
  created_at: z.string(),
  name: z.string(),
});

export const DatasetRow = z.object({
  id: z.union([z.number(), z.string()]),
  index: z.union([z.number(), z.string()]),
  created_at: z.string(),
  data: z.record(z.any()),
});

export const DatasetsResponse = z
  .object({
    data: z.array(Dataset),
  })
  .transform((res) => ({ data: res.data }));

export const DatasetResponse = z
  .object({ data: Dataset })
  .transform((res) => ({ data: res.data }));

export const DatasetRowsResponse = z
  .object({
    data: z.array(DatasetRow),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));

export const CreateDatasetSchema = z.object({
  file_id: z.union([z.number(), z.string()]),
  name: z.string().min(2),
});

export const CreateDatasetFileUpload = z.object({
  name: z.string().min(2),
  file: z.any().refine((file: File) => file.size > 0, 'File is required'),
});
