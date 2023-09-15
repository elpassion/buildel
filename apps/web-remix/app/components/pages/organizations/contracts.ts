import { z } from "zod";

export const OrganizationsResponse = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});
