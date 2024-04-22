import { fetchTyped } from "~/utils/fetch.server";
import {
  CreateOrganizationSchema,
  OrganizationResponse,
  OrganizationsResponse,
  MembershipsResponse,
  APIKeyResponse,
  InvitationsResponse,
  InvitationResponse,
  WorkflowTemplatesResponse,
  ICreateFromTemplateSchema,
  CreateFromTemplateResponse,
} from "./organization.contracts";
import z from "zod";

export class OrganizationApi {
  constructor(private client: typeof fetchTyped) {}

  getOrganizations() {
    return this.client(OrganizationsResponse, "/organizations");
  }

  getOrganization(organizationId: string | number) {
    return this.client(
      OrganizationResponse,
      `/organizations/${organizationId}`
    );
  }

  createOrganization(data: z.TypeOf<typeof CreateOrganizationSchema>) {
    return this.client(OrganizationResponse, "/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getMemberships(organizationId: string | number) {
    return this.client(
      MembershipsResponse,
      `/organizations/${organizationId}/memberships`
    );
  }

  getApiKey(organizationId: string | number) {
    return this.client(
      APIKeyResponse,
      `/organizations/${organizationId}/api_key`
    );
  }

  getInvitations(organizationId: string | number) {
    return this.client(
      InvitationsResponse,
      `/organizations/${organizationId}/invitations`
    );
  }

  createInvitation(organizationId: string | number, data: { email: string }) {
    return this.client(
      InvitationResponse,
      `/organizations/${organizationId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  deleteInvitation(
    organizationId: string | number,
    invitationId: string | number
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/invitations/${invitationId}`,
      {
        method: "DELETE",
      }
    );
  }

  acceptInvitation(token: string) {
    return this.client(
      z.any(),
      `/organizations/invitations/accept?token=${token}`,
      {
        method: "POST",
      }
    );
  }

  getTemplates(organizationId: string | number) {
    return this.client(
      WorkflowTemplatesResponse,
      `/organizations/${organizationId}/workflow_templates`
    );
  }

  createFromTemplate(
    organizationId: string | number,
    data: ICreateFromTemplateSchema
  ) {
    return this.client(
      CreateFromTemplateResponse,
      `/organizations/${organizationId}/workflow_templates`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
}
