import { z } from "zod";

export const CurrentUser = z.object({
  id: z.number(),
});

export type ICurrentUser = z.TypeOf<typeof CurrentUser>;

export const CurrentUserResponse = z
  .object({
    data: CurrentUser,
  })
  .transform((res) => res.data);
