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

export const ApiKey = z.object({
  id: z.number(),
  key: z.string(),
  created_at: z.string(),
});

export const ApiKeyList = z.array(ApiKey);

export const ApiKeyResponse = z
  .object({ data: ApiKey })
  .transform((res) => res.data);

export const ApiKeyListResponse = z
  .object({
    data: ApiKeyList,
  })
  .transform((res) => res.data);
