import { z } from "zod";

export const Organization = z.object({
  id: z.number(),
  name: z.string(),
});

export type IOrganization = z.TypeOf<typeof Organization>;

export const OrganizationsResponse = z.object({
  data: z.array(Organization),
});

export const OrganizationResponse = z.object({
  data: Organization,
});

export const CreateOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2),
  }),
});

export type ICreateOrganizationSchema = z.TypeOf<
  typeof CreateOrganizationSchema
>;

export const Membership = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    email: z.string(),
  }),
});

export const MembershipsResponse = z.object({
  data: z.array(Membership),
});
export const MembershipResponse = z.object({
  data: Membership,
});

export const APIKey = z.object({
  key: z.union([z.string(), z.null()]),
});

export const APIKeyResponse = z
  .object({ data: APIKey })
  .transform((res) => res.data);
