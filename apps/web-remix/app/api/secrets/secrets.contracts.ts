import { z } from "zod";

export const SecretKey = z.object({
  id: z.string(),
  name: z.string(),
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

export const CreateUpdateSecretSchema = z.object({
  name: z.string().min(2),
  value: z.string().min(2),
});

export type ICreateUpdateSecretSchema = z.TypeOf<
  typeof CreateUpdateSecretSchema
>;
