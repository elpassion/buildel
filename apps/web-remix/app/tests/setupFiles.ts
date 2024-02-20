import { vi } from "vitest";
import { WebSocketMock } from "./WebSocket.mock";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// @ts-ignore
global.WebSocket = WebSocketMock;
