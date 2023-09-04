export const ROUTES = {
  HOME: '/',
  PIPELINES: '/pipelines',
  PIPELINE: (organizationId: string, pipelineId: string) => {
    return `/organizations/${organizationId}/pipelines/${pipelineId}`;
  },
};
