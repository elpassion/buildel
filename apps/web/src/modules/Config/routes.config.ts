export const ROUTES = {
  HOME: '/',
  PIPELINES: '/pipelines',
  PIPELINE: (id: string) => {
    return `/pipelines/${id}`;
  },
};
