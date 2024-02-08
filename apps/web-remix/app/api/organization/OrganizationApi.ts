import { fetchTyped } from "~/utils/fetch.server";
import {
  CreateOrganizationSchema,
  OrganizationResponse,
  OrganizationsResponse,
} from "./organization.contracts";
import z from "zod";

export class OrganizationApi {
  constructor(private client: typeof fetchTyped) {}

  getOrganizations() {
    return this.client(OrganizationsResponse, "/organizations");
  }

  createOrganization(data: z.TypeOf<typeof CreateOrganizationSchema>) {
    return this.client(OrganizationResponse, "/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
