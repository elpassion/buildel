export const ROUTES = {
  HOME: '/',
  EXAMPLE: '/example',
  PROJECTS: '/projects',
  PROJECT: (id: string) => {
    return `/projects/${id}`;
  },
  APPS: '/apps',
  APP: (id: string) => {
    return `/apps/${id}`;
  },
};
