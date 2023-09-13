import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Socket } from "phoenix";
import { assert } from "~/utils/assert";
import { uniqueId } from "lodash";
import { v4 } from "uuid";
export function usePipelineRun(
  organizationId: number,
  pipelineId: number,
  onOutput: (
    blockId: string,
    outputName: string,
    payload: unknown
  ) => void = () => {},
  onStatusChange: (blockId: string, isWorking: boolean) => void = () => {}
) {
  const socket = useRef<Socket>();
  const id = useRef<string>();
  const channel = useRef<Channel>();

  const [status, setStatus] = useState<"idle" | "starting" | "running">("idle");

  const startRun = useCallback(async () => {
    assert(socket.current);

    const token = await fetch("/super-api/channel_auth", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        socket_id: id.current,
        channel_name: `pipelines:${organizationId}:${pipelineId}`,
      }),
    }).then((response) => response.json());

    setStatus("starting");
    const newChannel = socket.current.channel(
      `pipelines:${organizationId}:${pipelineId}`,
      token
    );
    newChannel.onMessage = (event: string, payload: any) => {
      if (event.startsWith("output:")) {
        const [_, blockId, outputName] = event.split(":");
        onOutput(blockId, outputName, payload);
      }
      if (event.startsWith("start:")) {
        const [_, blockId] = event.split(":");
        onStatusChange(blockId, true);
      }
      if (event.startsWith("stop:")) {
        const [_, blockId] = event.split(":");
        onStatusChange(blockId, false);
      }
      return payload;
    };
    channel.current = newChannel;

    if (!socket.current.isConnected()) {
      socket.current.connect();
      socket.current.onOpen(() => {
        assert(socket.current);
        newChannel.join().receive("ok", (response) => {
          console.log("Joined successfully", response);
          setStatus("running");
        });
      });
      socket.current.onError(() => {
        setStatus("idle");
      });
    } else if (newChannel.state !== "joined") {
      newChannel.join().receive("ok", (response) => {
        console.log("Joined successfully", response);
        setStatus("running");
      });
    }
  }, [onOutput, pipelineId]);

  const stopRun = useCallback(() => {
    console.log("stop");
    assert(channel.current);
    channel.current.leave();
    setStatus("idle");
  }, []);

  const push = useCallback(
    (topic: string, payload: any) => {
      if (status !== "running") {
        alert("Start process first");
      }

      assert(channel.current);

      if (payload instanceof File) {
        payload.arrayBuffer().then((arrayBuffer) => {
          assert(channel.current);
          channel.current.push(`input:${topic}`, arrayBuffer);
        });
      } else if (payload instanceof FileList) {
        [...payload].forEach((file) => {
          file.arrayBuffer().then((arrayBuffer) => {
            assert(channel.current);
            channel.current.push(`input:${topic}`, arrayBuffer);
          });
        });
      } else {
        channel.current.push(`input:${topic}`, payload);
      }
    },
    [status]
  );

  useEffect(() => {
    id.current = v4();
    socket.current = new Socket("/super-api/socket", {
      logger: (kind, msg, data) => {
        console.log(`${kind}: ${msg}`, data);
      },
      params: {
        id: id.current,
      },
    });
  }, []);

  return {
    status,
    startRun,
    stopRun,
    push,
  };
}
