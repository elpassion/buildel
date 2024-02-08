import { z } from "zod";

export const OrganizationsResponse = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});

export const OrganizationResponse = z.object({
  data: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export const CreateOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2),
  }),
});
