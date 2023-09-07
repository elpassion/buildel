export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  ORGANIZATION: (organizationId: string) => {
    return `/${organizationId}`;
  },
  ORGANIZATION_PIPELINES: (organizationId: string) => {
    return `/${organizationId}/pipelines`;
  },
  ORGANIZATIONS: '/organizations',
  PIPELINE: (organizationId: string, pipelineId: string) => {
    return `/${organizationId}/pipelines/${pipelineId}`;
  },
};
