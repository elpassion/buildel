import type {
  APIKey,
  Membership,
  Organization,
} from "~/api/organization/organization.contracts";
import type { z } from "zod";

export type IAPIKey = z.TypeOf<typeof APIKey>;

export type IOrganization = z.TypeOf<typeof Organization>;

export type IMembership = z.TypeOf<typeof Membership>;
