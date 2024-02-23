import { http, HttpResponse } from "msw";
import {
  ICreateOrganizationSchema,
  IOrganization,
} from "~/api/organization/organization.contracts";

export class OrganizationHandlers {
  private organizations: Map<number, IOrganization> = new Map();

  constructor(initials: IOrganization[] = []) {
    initials.forEach((org) => this.organizations.set(org.id, org));
  }

  getOrganizations() {
    return http.get("/super-api/organizations", () => {
      return HttpResponse.json<{ data: IOrganization[] }>(
        { data: [...this.organizations.values()] },
        {
          status: 200,
        }
      );
    });
  }

  createOrganization() {
    return http.post<any, ICreateOrganizationSchema>(
      "/super-api/organizations",
      async ({ request }) => {
        const data = await request.json();
        const id = this.organizations.size + 1;

        const newOrganization = {
          id,
          name: data.organization.name,
        };

        this.organizations.set(id, newOrganization);

        return HttpResponse.json(
          { data: newOrganization },
          {
            status: 200,
          }
        );
      }
    );
  }

  get handlers() {
    return [this.getOrganizations(), this.createOrganization()];
  }
}
