import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Socket } from "phoenix";
export function usePipelineRun(
  pipelineId: number,
  onOutput: (
    blockId: string,
    outputName: string,
    payload: unknown
  ) => void = () => {},
  onStatusChange: (blockId: string, isWorking: boolean) => void = () => {}
) {
  const socket = useRef<Socket>();
  const channel = useRef<Channel>();

  const [status, setStatus] = useState<"idle" | "starting" | "running">("idle");

  const startRun = useCallback(() => {
    assert(socket.current);

    setStatus("starting");
    const newChannel = socket.current.channel(`pipelines:${pipelineId}`, {});
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
    socket.current = new Socket("ws://127.0.0.1:3000/super-api/socket", {
      logger: (kind, msg, data) => {
        console.log(`${kind}: ${msg}`, data);
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

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
