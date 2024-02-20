export class WebSocketMock {
  url: string;
  readyState: any;
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string) {
    console.log(`WebSocketMock created for url: ${url}`);
    this.url = url;
    this.readyState = WebSocket.OPEN;
  }

  send(data: unknown) {
    console.log(`Mock send: ${JSON.stringify(data)}`);
  }

  close() {
    console.log(`Mock WebSocket closed`);
    this.readyState = WebSocketMock.CLOSED;
  }
}
