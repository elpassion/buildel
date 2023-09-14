import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Socket } from "phoenix";
import { assert } from "~/utils/assert";
import { v4 } from "uuid";
import { useFetcher } from "@remix-run/react";
import { uploadSchema } from "~/components/pages/pipelines/show/schema";

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
  const uploadFetcher = useFetcher<typeof uploadSchema>();

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
  console.log(uploadFetcher.data);
  const push = useCallback(
    (topic: string, payload: any) => {
      if (status !== "running") {
        alert("Start process first");
      }

      assert(channel.current);

      if (payload instanceof File) {
        console.log(payload);
        const formData = new FormData();
        formData.append("file", payload);
        formData.append("collection_name", "test");

        fetch("http://localhost:4000/api/organizations/5/memories", {
          body: formData,
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => console.log(res));
        // uploadFetcher.submit(formData, { method: "POST" });
        // payload.arrayBuffer().then((arrayBuffer) => {
        //   assert(channel.current);
        //   // channel.current.push(`input:${topic}`, arrayBuffer);
        // });
      } else if (payload instanceof FileList) {
        console.log([...payload]);
        // [...payload].forEach((file) => {
        //   file.arrayBuffer().then((arrayBuffer) => {
        //     assert(channel.current);
        //     // channel.current.push(`input:${topic}`, arrayBuffer);
        //   });
        // });
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
