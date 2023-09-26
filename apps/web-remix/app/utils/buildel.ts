import { Channel, Socket } from "phoenix";
import { v4 } from "uuid";
import { assert } from "./assert";

export class BuildelSocket {
  private readonly socket: Socket;
  private readonly id: string;

  constructor(private readonly organizationId: number) {
    this.id = v4();
    this.socket = new Socket("/super-api/socket", {
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

  public run(
    pipelineId: number,
    handlers?: {
      onOutput: (blockId: string, outputName: string, payload: unknown) => void;
      onStatusChange: (blockId: string, isWorking: boolean) => void;
    }
  ) {
    const onOutput = handlers?.onOutput ?? (() => {});
    const onStatusChange = handlers?.onStatusChange ?? (() => {});

    return new BuildelRun(
      this.socket,
      this.id,
      this.organizationId,
      pipelineId,
      { onOutput, onStatusChange }
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
    private readonly handlers: {
      onOutput: (blockId: string, outputName: string, payload: unknown) => void;
      onStatusChange: (blockId: string, isWorking: boolean) => void;
    }
  ) {}

  public async start() {
    if (this.status !== "idle") return;

    const token = await this.authenticateChannel(this.pipelineId);

    this.channel = this.socket.channel(
      `pipelines:${this.organizationId}:${this.pipelineId}`,
      token
    );

    this.channel.onMessage = (event: string, payload: any) => {
      if (event.startsWith("output:")) {
        const [_, blockId, outputName] = event.split(":");
        this.handlers.onOutput(blockId, outputName, payload);
      }
      if (event.startsWith("start:")) {
        const [_, blockId] = event.split(":");
        this.handlers.onStatusChange(blockId, true);
      }
      if (event.startsWith("stop:")) {
        const [_, blockId] = event.split(":");
        this.handlers.onStatusChange(blockId, false);
      }
      return payload;
    };

    return new Promise<BuildelRun>((resolve, reject) => {
      assert(this.channel);
      this.channel.join().receive("ok", (response) => {
        resolve(this);
      });
      this.channel.onError((error) => {
        reject(error);
      });
    });
  }

  public async stop() {
    if (this.status !== "running") return;

    return new Promise<BuildelRun>((resolve, reject) => {
      assert(this.channel);
      this.channel.leave().receive("ok", (response) => {
        this.channel = null;
        resolve(this);
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
    } else {
      assert(this.channel);
      this.channel.push(`input:${topic}`, payload);
    }
  }

  public get status() {
    if (this.channel === null) return "idle";
    return this.channel.state === "joined" ? "running" : "starting";
  }

  private async authenticateChannel(pipelineId: number) {
    return await fetch("/super-api/channel_auth", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        socket_id: this.id,
        channel_name: `pipelines:${this.organizationId}:${pipelineId}`,
      }),
    }).then((response) => response.json());
  }
}
