import { setupServer } from "msw/node";
import { HttpHandler } from "msw";

export const server = (handlers: HttpHandler[] = []) =>
  setupServer(...handlers);
