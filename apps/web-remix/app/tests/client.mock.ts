import { setupWorker } from "msw/browser";
import { HttpHandler } from "msw";

export const worker = (handlers: HttpHandler[] = []) =>
  setupWorker(...handlers);
