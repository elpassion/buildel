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
