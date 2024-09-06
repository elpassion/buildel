import { Channel, ConnectionState, Socket } from "phoenix";
import { v4 } from "uuid";
import { assert } from "./utils/assert.ts";

interface BuildelSocketOptions {
  socketUrl?: string;
  authUrl?: string;
  headers?: Record<string, string>;
  useAuth?: boolean;
  onStatusChange?: (status: ConnectionState) => void;
}
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
    options: BuildelSocketOptions = {},
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

  public run(
    pipelineId: number,
    handlers?: {
      onBlockOutput?: (
        blockId: string,
        outputName: string,
        payload: unknown,
      ) => void;
      onError: (error: string) => void;
      onBlockError?: (blockId: string, errors: string[]) => void;
      onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
      onStatusChange?: (status: BuildelRunStatus) => void;
    },
  ) {
    const onBlockOutput = handlers?.onBlockOutput ?? (() => {});
    const onBlockStatusChange = handlers?.onBlockStatusChange ?? (() => {});
    const onStatusChange = handlers?.onStatusChange ?? (() => {});
    const onBlockError = handlers?.onBlockError ?? (() => {});
    const onError = handlers?.onError ?? (() => {});

    return new BuildelRun(
      this.socket,
      this.id,
      this.organizationId,
      pipelineId,
      this.authUrl,
      this.headers,
      this.useAuth,
      {
        onBlockOutput,
        onBlockStatusChange,
        onStatusChange,
        onBlockError,
        onError,
      },
    );
  }

  public logs(
    pipelineId: number,
    runId: number,
    handlers?: {
      onMessage: (payload: unknown) => void;
      onLogMessage: (payload: unknown) => void;
      onStatusChange: (status: BuildelRunLogsConnectionStatus) => void;
      onError: (error: string) => void;
    },
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
      },
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
    private readonly handlers: {
      onMessage: (payload: unknown) => void;
      onLogMessage: (payload: unknown) => void;
      onStatusChange: (status: BuildelRunLogsConnectionStatus) => void;
      onError: (error: string) => void;
    },
  ) {}

  public async join(args: BuildelRunLogsJoinArgs) {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel();

    this.channel = this.socket.channel(
      `logs:${this.organizationId}:${this.pipelineId}:${this.runId}`,
      {
        ...token,
        block_name: args.block_name,
      },
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
    private readonly handlers: {
      onBlockOutput: (
        blockId: string,
        outputName: string,
        payload: unknown,
      ) => void;
      onBlockStatusChange: (blockId: string, isWorking: boolean) => void;
      onStatusChange: (status: BuildelRunStatus) => void;
      onBlockError: (blockId: string, errors: string[]) => void;
      onError: (error: string) => void;
    },
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
      },
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
      },
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
              payload.response.errors[blockId],
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
        channel_name: `pipelines:${this.organizationId}:${this.pipelineId}${runId ? `:${runId}` : ""}`,
      }),
    }).then((response) => response.json());
  }
}

export type BuildelRunStatus = "idle" | "starting" | "running";

export type BuildelRunStartArgs = {
  initial_inputs?: { name: string; value: string }[];
  alias?: string;
  metadata?: Record<string, any>;
};

export type BuildelRunJoinArgs = BuildelRunStartArgs & {
  runId: number;
};

export type BuildelRunLogsConnectionStatus = "idle" | "joining" | "joined";

export type BuildelRunLogsJoinArgs = {
  block_name?: string;
};
