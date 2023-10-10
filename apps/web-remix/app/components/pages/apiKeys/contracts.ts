import { z } from "zod";

export const ApiKey = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(),
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
