export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
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
