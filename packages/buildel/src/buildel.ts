import { Channel, ConnectionState, Socket } from "phoenix";
import { v4 } from "uuid";
import { assert } from "./utils/assert.ts";

interface BuildelSocketOptions {
  socketUrl?: string;
  authUrl?: string;
  headers?: Record<string, string>;
}
export class BuildelSocket {
  private readonly socket: Socket;
  private readonly id: string;
  private readonly authUrl: string;
  private readonly socketUrl: string;
  private readonly headers: Record<string, string>;

  constructor(
    private readonly organizationId: number,
    options: BuildelSocketOptions = {}
  ) {
    this.authUrl = options.authUrl ?? "/super-api/channel_auth";
    this.socketUrl = options.socketUrl ?? "wss://buildel-api.fly.dev/socket";
    this.headers = options.headers ?? {};
    this.id = v4();
    this.socket = new Socket(this.socketUrl, {
      params: {
        id: this.id,
      },
    });
  }

  public async connect() {
    return new Promise<BuildelSocket>((resolve, reject) => {
      this.socket.connect();
      this.socket.onOpen(() => {
        resolve(this);
      });
      this.socket.onError((error) => {
        reject(error);
      });
    });
  }

  public async disconnect() {
    return new Promise<BuildelSocket>((resolve, reject) => {
      this.socket.disconnect(() => {
        resolve(this);
      });
      this.socket.onError((error) => {
        reject(error);
      });
    });
  }

  public status(): ConnectionState {
    return this.socket.connectionState();
  }

  public run(
    pipelineId: number,
    handlers?: {
      onBlockOutput?: (
        blockId: string,
        outputName: string,
        payload: unknown
      ) => void;
      onBlockError?: (blockId: string, errors: string[]) => void;
      onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
      onStatusChange?: (status: BuildelRunStatus) => void;
    }
  ) {
    const onBlockOutput = handlers?.onBlockOutput ?? (() => {});
    const onBlockStatusChange = handlers?.onBlockStatusChange ?? (() => {});
    const onStatusChange = handlers?.onStatusChange ?? (() => {});
    const onBlockError = handlers?.onBlockError ?? (() => {});

    return new BuildelRun(
      this.socket,
      this.id,
      this.organizationId,
      pipelineId,
      this.authUrl,
      this.headers,
      { onBlockOutput, onBlockStatusChange, onStatusChange, onBlockError }
    );
  }
}

export class BuildelRun {
  private channel: Channel | null = null;

  public constructor(
    private readonly socket: Socket,
    private readonly id: string,
    private readonly organizationId: number,
    private readonly pipelineId: number,
    private readonly authUrl: string,
    private readonly headers: Record<string, string>,
    private readonly handlers: {
      onBlockOutput: (
        blockId: string,
        outputName: string,
        payload: unknown
      ) => void;
      onBlockStatusChange: (blockId: string, isWorking: boolean) => void;
      onStatusChange: (status: BuildelRunStatus) => void;
      onBlockError: (blockId: string, errors: string[]) => void;
    }
  ) {}

  public async start() {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel();

    this.channel = this.socket.channel(
      `pipelines:${this.organizationId}:${this.pipelineId}`,
      token
    );

    this.channel.onMessage = (event: string, payload: any) => {
      if (event === "phx_reply" && payload.status === "error") {
        Object.keys(payload.response.errors).forEach((blockId) => {
          this.handlers.onBlockError(blockId, payload.response.errors[blockId]);
        });

        return this.stop();
      }
      if (event.startsWith("output:")) {
        const [_, blockId, outputName] = event.split(":");
        this.handlers.onBlockOutput(blockId, outputName, payload);
      }
      if (event.startsWith("start:")) {
        const [_, blockId] = event.split(":");
        this.handlers.onBlockStatusChange(blockId, true);
      }
      if (event.startsWith("stop:")) {
        const [_, blockId] = event.split(":");
        this.handlers.onBlockStatusChange(blockId, false);
      }
      if (event.startsWith("error:")) {
        const [_, blockId] = event.split(":");
        this.handlers.onBlockError(blockId, payload.errors);
      }
      return payload;
    };

    return new Promise<BuildelRun>((resolve, reject) => {
      assert(this.channel);
      this.channel.join().receive("ok", () => {
        resolve(this);
        this.handlers.onStatusChange("running");
      });
      this.channel.onError((error) => {
        reject(error);
        this.handlers.onStatusChange("idle");
      });
    });
  }

  public async stop() {
    if (this.status !== "running" && this.status !== "starting") return;

    return new Promise<BuildelRun>((resolve, reject) => {
      assert(this.channel);
      this.channel.leave().receive("ok", () => {
        this.channel = null;
        resolve(this);
        this.handlers.onStatusChange("idle");
      });
      this.channel.onError((error) => {
        reject(error);
      });
    });
  }

  public async push(topic: string, payload: any) {
    if (this.status !== "running") return;

    if (payload instanceof File) {
      throw new Error("Please send files through REST API");
    } else if (payload instanceof FileList) {
      throw new Error("Please send files through REST API");
    } else if (payload instanceof Blob) {
      assert(this.channel);
      this.channel.push(`input:${topic}`, await payload.arrayBuffer());
    } else {
      assert(this.channel);
      this.channel.push(`input:${topic}`, payload);
    }
  }

  public get status(): BuildelRunStatus {
    if (this.socket.connectionState() !== "open" || this.channel === null)
      return "idle";
    return this.channel.state === "joined" ? "running" : "starting";
  }

  private async authenticateChannel() {
    return await fetch(this.authUrl, {
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        socket_id: this.id,
        channel_name: `pipelines:${this.organizationId}:${this.pipelineId}`,
      }),
    }).then((response) => response.json());
  }
}

export type BuildelRunStatus = "idle" | "starting" | "running";
