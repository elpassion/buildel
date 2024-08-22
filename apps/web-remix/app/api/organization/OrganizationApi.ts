import z from 'zod';

import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import {
  APIKeyResponse,
  CrawlSitemapResponse,
  CreateFromTemplateResponse,
  InvitationResponse,
  InvitationsResponse,
  MembershipsResponse,
  OrganizationCostResponse,
  OrganizationResponse,
  OrganizationsResponse,
  WorkflowTemplatesResponse,
} from './organization.contracts';
import type {
  CreateOrganizationSchema,
  ICreateFromTemplateSchema,
} from './organization.contracts';

export class OrganizationApi {
  constructor(private client: typeof fetchTyped) {}

  getOrganizations() {
    return this.client(OrganizationsResponse, '/organizations');
  }

  getOrganization(organizationId: string | number) {
    return this.client(
      OrganizationResponse,
      `/organizations/${organizationId}`,
    );
  }

  createOrganization(data: z.TypeOf<typeof CreateOrganizationSchema>) {
    return this.client(OrganizationResponse, '/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMemberships(organizationId: string | number) {
    return this.client(
      MembershipsResponse,
      `/organizations/${organizationId}/memberships`,
    );
  }

  getApiKey(organizationId: string | number) {
    return this.client(
      APIKeyResponse,
      `/organizations/${organizationId}/api_key`,
    );
  }

  getInvitations(organizationId: string | number) {
    return this.client(
      InvitationsResponse,
      `/organizations/${organizationId}/invitations`,
    );
  }

  createInvitation(organizationId: string | number, data: { email: string }) {
    return this.client(
      InvitationResponse,
      `/organizations/${organizationId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  deleteInvitation(
    organizationId: string | number,
    invitationId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/invitations/${invitationId}`,
      {
        method: 'DELETE',
      },
    );
  }

  acceptInvitation(token: string) {
    return this.client(
      z.any(),
      `/organizations/invitations/accept?token=${token}`,
      {
        method: 'POST',
      },
    );
  }

  getTemplates(organizationId: string | number) {
    return this.client(
      WorkflowTemplatesResponse,
      `/organizations/${organizationId}/workflow_templates`,
    );
  }

  getCosts(
    organizationId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(`/organizations/${organizationId}/costs`, {
      ...pagination,
    });
    return this.client(OrganizationCostResponse, url);
  }

  createFromTemplate(
    organizationId: string | number,
    data: ICreateFromTemplateSchema,
  ) {
    return this.client(
      CreateFromTemplateResponse,
      `/organizations/${organizationId}/workflow_templates`,
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  crawl(
    organizationId: string | number,
    data: { url: string; memory_collection_id: string; max_depth?: number },
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/tools/crawls`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async discoverPages(organizationId: string | number, websiteUrl: string) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/tools/crawls/sitemap`,
      { url: websiteUrl },
    );

    return this.client(CrawlSitemapResponse, url);
  }
}
