import { setupServer } from "msw/node";
import type { HttpHandler } from "msw";

export const server = (handlers: HttpHandler[] = []) =>
  setupServer(...handlers);
