import { z } from 'zod';

import { PaginationMeta } from '~/components/pagination/pagination.types';

export const Dataset = z.object({
  id: z.union([z.number(), z.string()]),
  created_at: z.string(),
  name: z.string(),
});

export const DatasetRow = z.object({
  id: z.union([z.number(), z.string()]),
  index: z.union([z.number(), z.string(), z.null()]),
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

export const DatasetRowResponse = z
  .object({ data: DatasetRow })
  .transform((res) => ({ data: res.data }));

export const DatasetRowsResponse = z
  .object({
    data: z.array(DatasetRow),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));

export const CreateDatasetSchema = z.object({
  file_id: z.union([z.number(), z.string()]).optional(),
  name: z.string().min(2),
});

export const CreateDatasetFileUpload = z.object({
  name: z.string().min(2),
  file: z.any().refine((file: File) => {
    return file.size > 0 ? file.type.includes('csv') : true;
  }, 'File must be a CSV file'),
});

export const UpdateDatasetRowSchema = z.object({
  data: z
    .string({ required_error: 'Invalid json value' })
    .refine(jsonValidator, 'Invalid json value'),
});

export const CreateDatasetRowSchema = z.object({
  data: z
    .string({ required_error: 'Invalid json value' })
    .refine(jsonValidator, 'Invalid json value'),
});

function jsonValidator(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
