import { z } from "zod";
import { APIKey, Organization } from "./contracts";

export type IAPIKey = z.TypeOf<typeof APIKey>;

export type IOrganization = z.TypeOf<typeof Organization>;
