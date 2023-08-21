export const ROUTES = {
  HOME: '/',
  EXAMPLE: '/example',
  PROJECTS: '/projects',
  PROJECT: (id: string) => {
    return `/projects/${id}`;
  },
  PIPELINES: '/pipelines',
  PIPELINE: (id: string) => {
    return `/pipelines/${id}`;
  },
};
