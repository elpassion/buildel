export const ROUTES = {
  HOME: '/',
  ORGANIZATION: (organizationId: string) => {
    return `/organizations/${organizationId}`;
  },
  ORGANIZATION_PIPELINES: (organizationId: string) => {
    return `/organizations/${organizationId}/pipelines`;
  },
  ORGANIZATIONS: '/organizations',
  PIPELINE: (organizationId: string, pipelineId: string) => {
    return `/organizations/${organizationId}/pipelines/${pipelineId}`;
  },
};
