import { z } from 'zod';

export const SecretKey = z.object({
  id: z.string(),
  name: z.string(),
  alias: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SecretKeyList = z.array(SecretKey);

export const SecretKeyResponse = z
  .object({ data: SecretKey })
  .transform((res) => res.data);

export const SecretKeyListResponse = z
  .object({
    data: SecretKeyList,
  })
  .transform((res) => res.data);

export const CreateSecretSchema = z.object({
  name: z
    .string()
    .min(2)
    .refine(
      (value) => !value.startsWith('__'),
      'Secret name cannot start with __',
    ),
  value: z.string().min(2),
  alias: z.string().optional(),
});

export const UpdateSecretSchema = z.object({
  name: z.string().min(2),
  value: z
    .string()
    .transform((value) => (value === '' ? undefined : value))
    .refine((value) => value === undefined || value.length >= 2, {
      message: 'Must be at least 2 characters long',
    })
    .optional(),
  alias: z.string().optional(),
});

export type ICreateSecretSchema = z.TypeOf<typeof CreateSecretSchema>;

export type IUpdateSecretSchema = z.TypeOf<typeof UpdateSecretSchema>;
