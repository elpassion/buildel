import type { HttpHandler } from 'msw';
import { setupServer } from 'msw/node';

export const server = (handlers: HttpHandler[] = []) =>
  setupServer(...handlers);
