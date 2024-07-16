import { setupWorker } from "msw/browser";
import type { HttpHandler } from "msw";

export const worker = (handlers: HttpHandler[] = []) =>
  setupWorker(...handlers);
