import { Server } from "mock-socket";

type WebSocketServerTestArgs = {
  url: string;
  onMessage?: (payload: any) => void;
};

const defaultArgs: WebSocketServerTestArgs = {
  url: "ws://localhost:3000/super-api/socket/websocket",
};

export class WebSocketServerMock {
  private readonly ws: Server;
  constructor(args?: Partial<WebSocketServerTestArgs>) {
    const { url, onMessage } = { ...args, ...defaultArgs };

    this.ws = new Server(url);

    this.ws.on("connection", (socket) => {
      socket.on("message", (data) => {
        if (typeof data !== "string") return;

        const parsedData = JSON.parse(data);
        const [channelId, refId, topicName, eventName, payload] = parsedData;

        onMessage?.(payload);

        if (eventName === "phx_join") {
          socket.send(
            JSON.stringify([
              channelId,
              refId,
              topicName,
              "phx_reply",
              { response: {}, status: "ok" },
            ])
          );
        }
      });

      setInterval(() => {
        socket.send(JSON.stringify([null, null, "phoenix", "heartbeat", {}]));
      }, 30000);
    });
  }

  send(args: {
    channelId?: string | null;
    refId?: string | null;
    topicName: string;
    eventName: string;
    payload: any;
  }) {
    const message = [
      args.channelId ?? null,
      args.refId ?? null,
      args.topicName,
      args.eventName,
      args.payload,
    ];

    this.ws.clients().forEach((client) => client.send(JSON.stringify(message)));
  }

  get server() {
    return this.ws;
  }

  close() {
    this.ws.close();
    return this;
  }
}
