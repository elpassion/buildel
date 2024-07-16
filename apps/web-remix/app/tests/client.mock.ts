import type { HttpHandler } from 'msw';
import { setupWorker } from 'msw/browser';

export const worker = (handlers: HttpHandler[] = []) =>
  setupWorker(...handlers);
