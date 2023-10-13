import { z } from "zod";

export const SecretKey = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(),
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
