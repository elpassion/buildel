import { z } from "zod";

export const APIKey = z.object({
  key: z.union([z.string(), z.null()]),
});

export const APIKeyResponse = z
  .object({ data: APIKey })
  .transform((res) => res.data);

export const Organization = z.object({
  id: z.number(),
  name: z.string(),
});

export const Membership = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    email: z.string(),
  }),
});
export const OrganizationResponse = z.object({
  data: Organization,
});
export const MembershipsResponse = z.object({
  data: z.array(Membership),
});
export const MembershipResponse = z.object({
  data: Membership,
});
