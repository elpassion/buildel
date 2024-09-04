import { http, HttpResponse } from 'msw';

import type {
  ICreateFromTemplateResponse,
  ICreateOrganizationSchema,
  IOrganization,
  IWorkflowTemplate,
} from '~/api/organization/organization.contracts';
import { templateFixture } from '~/tests/fixtures/templates.fixtures';

export class OrganizationHandlers {
  private organizations: Map<number, IOrganization> = new Map();

  constructor(initials: IOrganization[] = []) {
    initials.forEach((org) => this.organizations.set(org.id, org));
  }

  getOrganization() {
    return http.get(
      '/super-api/organizations/:organizationId',
      ({ params }) => {
        const id = Number(params.organizationId);
        const organization = this.organizations.get(id);

        if (!organization) {
          return HttpResponse.json(
            { error: 'Organization not found' },
            {
              status: 404,
            },
          );
        }

        return HttpResponse.json<{ data: IOrganization }>(
          { data: organization },
          {
            status: 200,
          },
        );
      },
    );
  }

  getOrganizations() {
    return http.get('/super-api/organizations', () => {
      return HttpResponse.json<{ data: IOrganization[] }>(
        { data: [...this.organizations.values()] },
        {
          status: 200,
        },
      );
    });
  }

  getOrganizationsError() {
    return http.get('/super-api/organizations', () => {
      return HttpResponse.json<{ data: IOrganization[] }>(null, {
        status: 500,
      });
    });
  }

  createOrganization() {
    return http.post<any, ICreateOrganizationSchema>(
      '/super-api/organizations',
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
          },
        );
      },
    );
  }

  getTemplates() {
    return http.get(
      '/super-api/organizations/:organizationId/workflow_templates',
      () => {
        return HttpResponse.json<{ data: IWorkflowTemplate[] }>(
          { data: [templateFixture()] },
          {
            status: 200,
          },
        );
      },
    );
  }

  createFromTemplate() {
    return http.post(
      '/super-api/organizations/:organizationId/workflow_templates',
      () => {
        return HttpResponse.json<{ data: ICreateFromTemplateResponse }>(
          { data: { pipeline_id: 999 } },
          {
            status: 200,
          },
        );
      },
    );
  }

  get handlers() {
    return [
      this.getOrganization(),
      this.getOrganizations(),
      this.createOrganization(),
      this.getTemplates(),
      this.createFromTemplate(),
    ];
  }
}
