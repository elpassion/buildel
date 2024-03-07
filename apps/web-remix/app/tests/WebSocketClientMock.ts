export class WebSocketClientMock {
  url: string;
  readyState: any;
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    this.readyState = WebSocket.OPEN;
  }

  send(data: unknown) {
    console.log(`Mock send: ${JSON.stringify(data)}`);
  }

  close() {
    this.readyState = WebSocketClientMock.CLOSED;
  }
}
