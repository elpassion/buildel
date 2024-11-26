import { Channel, ConnectionState, Socket } from "phoenix";
import { v4 } from "uuid";
import { assert } from "./utils/assert.ts";
import type {
  BuildelRunStatus,
  BuildelRunStartArgs,
  BuildelRunLogsConnectionStatus,
  BuildelRunLogsJoinArgs,
  BuildelRunJoinArgs,
  BuildelSocketOptions,
  BuildelRunHistoryEvent,
  BuildelRunHandlers,
  BuildelRunLogsHandlers,
} from "./buildel.types.ts";

export class BuildelSocket {
  private readonly socket: Socket;
  private readonly id: string;
  private readonly authUrl: string;
  private readonly socketUrl: string;
  private readonly headers: Record<string, string>;
  private readonly useAuth: boolean = true;
  private readonly onStatusChange: (status: ConnectionState) => void;

  constructor(
    private readonly organizationId: number,
    options: BuildelSocketOptions = {}
  ) {
    this.authUrl = options.authUrl ?? "/super-api/channel_auth";
    this.socketUrl = options.socketUrl ?? "wss://api.buildel.ai/socket";
    this.headers = options.headers ?? {};
    this.id = v4();
    this.socket = new Socket(this.socketUrl, {
      params: {
        id: this.id,
      },
    });
    this.useAuth = options.useAuth ?? true;
    this.onStatusChange =
      options.onStatusChange ?? ((_status: ConnectionState) => {});
  }

  public async connect() {
    return new Promise<BuildelSocket>((resolve, reject) => {
      this.socket.connect();
      this.socket.onOpen(() => {
        this.onStatusChange(this.status());
        resolve(this);
      });
      this.socket.onError((error) => {
        this.onStatusChange(this.status());
        reject(error);
      });
    });
  }

  public async disconnect() {
    return new Promise<BuildelSocket>((resolve, reject) => {
      this.socket.disconnect(() => {
        this.onStatusChange(this.status());
        resolve(this);
      });
      this.socket.onError((error) => {
        this.onStatusChange(this.status());
        reject(error);
      });
    });
  }

  public status(): ConnectionState {
    return this.socket.connectionState();
  }

  public run(pipelineId: number, handlers?: Partial<BuildelRunHandlers>) {
    const onConnect = handlers?.onConnect ?? (() => {});
    const onBlockOutput = handlers?.onBlockOutput ?? (() => {});
    const onBlockStatusChange = handlers?.onBlockStatusChange ?? (() => {});
    const onStatusChange = handlers?.onStatusChange ?? (() => {});
    const onBlockError = handlers?.onBlockError ?? (() => {});
    const onError = handlers?.onError ?? (() => {});
    const onHistory = handlers?.onHistory ?? (() => {});

    return new BuildelRun(
      this.socket,
      this.id,
      this.organizationId,
      pipelineId,
      this.authUrl,
      this.headers,
      this.useAuth,
      {
        onConnect,
        onBlockOutput,
        onBlockStatusChange,
        onStatusChange,
        onBlockError,
        onError,
        onHistory,
      }
    );
  }

  public logs(
    pipelineId: number,
    runId: number,
    handlers?: Partial<BuildelRunLogsHandlers>
  ) {
    const onMessage = handlers?.onMessage ?? (() => {});
    const onLogMessage = handlers?.onLogMessage ?? (() => {});
    const onStatusChange = handlers?.onStatusChange ?? (() => {});
    const onError = handlers?.onError ?? (() => {});

    return new BuildelRunLogs(
      this.socket,
      this.id,
      this.organizationId,
      pipelineId,
      runId,
      this.authUrl,
      this.headers,
      this.useAuth,
      {
        onMessage,
        onLogMessage,
        onStatusChange,
        onError,
      }
    );
  }
}

export class BuildelRunLogs {
  private channel: Channel | null = null;

  public constructor(
    private readonly socket: Socket,
    private readonly id: string,
    private readonly organizationId: number,
    private readonly pipelineId: number,
    private readonly runId: number,
    private readonly authUrl: string,
    private readonly headers: Record<string, string>,
    private readonly useAuth: boolean,
    private readonly handlers: BuildelRunLogsHandlers
  ) {}

  public async join(args: BuildelRunLogsJoinArgs) {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel();

    this.channel = this.socket.channel(
      `logs:${this.organizationId}:${this.pipelineId}:${this.runId}`,
      {
        ...token,
        block_name: args.block_name,
      }
    );

    this.channel.onMessage = (event: string, payload: any) => {
      if (event === "phx_reply" && payload.status === "error") {
        if (payload.response.reason) {
          this.handlers.onError(payload.response.reason);
        }

        this.handlers.onError("Unknown error");

        return this.leave();
      }

      if (event.startsWith("logs:")) {
        this.handlers.onLogMessage(payload);
      }

      this.handlers.onMessage(payload);

      return payload;
    };

    return new Promise<BuildelRunLogs>((resolve, reject) => {
      assert(this.channel);
      this.channel.join().receive("ok", () => {
        resolve(this);
        this.handlers.onStatusChange("joined");
      });
      this.channel.onError((error) => {
        reject(error);
        this.handlers.onStatusChange("idle");
      });
    });
  }

  public async leave() {
    if (this.status !== "joined" && this.status !== "joining") return;

    return new Promise<BuildelRunLogs>((resolve, reject) => {
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

  public get status(): BuildelRunLogsConnectionStatus {
    if (this.socket.connectionState() !== "open" || this.channel === null)
      return "idle";
    return this.channel.state === "joined" ? "joined" : "joining";
  }

  private async authenticateChannel() {
    if (!this.useAuth) return {};

    return await fetch(this.authUrl, {
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        socket_id: this.id,
        channel_name: `logs:${this.organizationId}:${this.pipelineId}:${this.runId}`,
      }),
    }).then((response) => response.json());
  }
}

export class BuildelRun {
  private channel: Channel | null = null;
  public runId: string | null = null;

  public constructor(
    private readonly socket: Socket,
    private readonly id: string,
    private readonly organizationId: number,
    private readonly pipelineId: number,
    private readonly authUrl: string,
    private readonly headers: Record<string, string>,
    private readonly useAuth: boolean,
    private readonly handlers: BuildelRunHandlers
  ) {}

  public async start(args: BuildelRunStartArgs = { initial_inputs: [] }) {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel();

    this.channel = this.socket.channel(
      `pipelines:${this.organizationId}:${this.pipelineId}`,
      {
        ...token,
        initial_inputs: args.initial_inputs,
        alias: args.alias,
        metadata: args.metadata,
      }
    );

    this.channel.onMessage = this.onMessage();

    return this.joinChannel();
  }

  public async join(args: BuildelRunJoinArgs) {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel(args.runId);

    this.channel = this.socket.channel(
      `pipelines:${this.organizationId}:${this.pipelineId}:${args.runId}`,
      {
        ...token,
        initial_inputs: args.initial_inputs ?? [],
        alias: args.alias,
        metadata: args.metadata,
      }
    );

    this.channel.onMessage = this.onMessage();

    return this.joinChannel();
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
      assert(this.channel);
      this.channel.push(
        `input:${topic}`,
        await this.encodeBinaryMessage(payload)
      );
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

  public async loadHistory() {
    if (this.status !== "running") return;
    assert(this.channel);

    this.channel.push("history", {});
  }

  public get status(): BuildelRunStatus {
    if (this.socket.connectionState() !== "open" || this.channel === null)
      return "idle";
    return this.channel.state === "joined" ? "running" : "starting";
  }

  private joinChannel(): Promise<BuildelRun> {
    return new Promise<BuildelRun>((resolve, reject) => {
      assert(this.channel);
      this.channel.join().receive("ok", (response) => {
        this.runId = response.run.id;
        resolve(this);
        this.handlers.onStatusChange("running");
      });
      this.channel.onError((error) => {
        reject(error);
        this.handlers.onStatusChange("idle");
      });
    });
  }

  private onMessage() {
    return (event: string, payload: any) => {
      if (event === "phx_reply" && payload.status === "error") {
        if (payload.response.errors) {
          Object.keys(payload.response.errors).forEach((blockId) => {
            this.handlers.onBlockError(
              blockId,
              payload.response.errors[blockId]
            );
          });
        }

        if (payload.response.reason) {
          this.handlers.onError(payload.response.reason);
        }

        return this.stop();
      }

      if (event.startsWith("output:")) {
        const [_, blockId, outputName] = event.split(":");

        if (typeof payload === "object" && payload instanceof ArrayBuffer) {
          const { metadata, chunk } = this.decodeBinaryMessage(payload);
          this.handlers.onBlockOutput(blockId, outputName, chunk, metadata);
        } else {
          this.handlers.onBlockOutput(
            blockId,
            outputName,
            { message: payload.message },
            { ...payload.metadata, created_at: payload.created_at }
          );
        }
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
      if (event === "phx_reply" && payload.response) {
        this.handlers.onConnect(
          payload.response.run,
          payload.response.pipeline
        );
      }
      if (event === "history") {
        this.handlers.onHistory(payload.events);

        payload.events.forEach((event: BuildelRunHistoryEvent) => {
          switch (event.type) {
            case "start_stream":
              return this.handlers.onBlockStatusChange(event.block, true);
            case "stop_stream":
              return this.handlers.onBlockStatusChange(event.block, false);
            case "text":
              return this.handlers.onBlockOutput(
                event.block,
                event.io,
                {
                  message: event.message,
                },
                { created_at: event.created_at }
              );
            case "binary":
              return this.handlers.onBlockOutput(
                event.block,
                event.io,
                event.message,
                { created_at: event.created_at }
              );
          }
        });
      }
      return payload;
    };
  }

  private async authenticateChannel(runId?: number) {
    if (!this.useAuth) return {};

    return await fetch(this.authUrl, {
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        socket_id: this.id,
        channel_name: `pipelines:${this.organizationId}:${this.pipelineId}${
          runId ? `:${runId}` : ""
        }`,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return {};
    });
  }

  private decodeBinaryMessage(buffer: ArrayBuffer) {
    const view = new DataView(buffer);

    const metadataSize = view.getUint32(0, false);

    const metadataStart = 4;
    const metadataEnd = metadataStart + metadataSize;
    const metadataBytes = new Uint8Array(
      buffer.slice(metadataStart, metadataEnd)
    );

    const payload = JSON.parse(new TextDecoder().decode(metadataBytes));

    const chunk = new Uint8Array(buffer.slice(metadataEnd));

    return {
      metadataSize,
      metadata: { ...payload?.metadata, created_at: payload?.created_at },
      chunk,
    };
  }

  private async encodeBinaryMessage(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileBuffer = event.target?.result as ArrayBuffer;

        const metadata = {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        };

        // Convert metadata to a JSON string and then to a Uint8Array
        const metadataJSON = JSON.stringify(metadata);
        const metadataBytes = new TextEncoder().encode(metadataJSON);

        // Create a buffer for the final output
        const metadataSize = metadataBytes.length;
        const chunk = new Uint8Array(fileBuffer);
        const totalSize = 4 + metadataSize + chunk.length;
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);

        // Write the metadata size as the first 4 bytes
        view.setUint32(0, metadataSize, false);

        // Write the metadata bytes immediately after the size
        new Uint8Array(buffer, 4, metadataSize).set(metadataBytes);

        // Write the chunk bytes after the metadata
        new Uint8Array(buffer, 4 + metadataSize).set(chunk);

        resolve(buffer);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
