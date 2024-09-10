import { useEffect, useRef, useState } from "react";
import { BuildelSocket } from "@buildel/buildel";
import type {
  BuildelRun,
  BuildelRunJoinArgs,
  BuildelRunStartArgs,
  BuildelRunStatus,
  BuildelSocketOptions,
} from "@buildel/buildel";

import { assert } from "~/utils/assert";

export interface UsePipelineRunArgs {
  organizationId: number;
  pipelineId: number;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
  onBlockError?: (blockId: string, errors: string[]) => void;
  onError?: (error: string) => void;
  socketArgs?: BuildelSocketOptions;
}

export function usePipelineRun({
  pipelineId,
  onError = () => {},
  onBlockError,
  onBlockStatusChange,
  onBlockOutput,
  organizationId,
  socketArgs = {
    useAuth: true,
    socketUrl: "/super-api/socket",
  },
}: UsePipelineRunArgs) {
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRun>();

  const [status, setStatus] = useState<BuildelRunStatus>("idle");

  const startRun = async (args: BuildelRunStartArgs) => {
    assert(run.current);
    await run.current.start(args);
  };
  const joinRun = async (args: BuildelRunJoinArgs) => {
    assert(run.current);
    await run.current.join(args);
  };
  const stopRun = async () => {
    assert(run.current);
    await run.current.stop();
  };
  const push = (topic: string, payload: any) => {
    assert(run.current);
    run.current.push(topic, payload);
  };

  useEffect(() => {
    buildel.current = new BuildelSocket(organizationId, socketArgs);

    buildel.current.connect().then((buildel) => {
      run.current = buildel.run(pipelineId, {
        onBlockOutput,
        onBlockStatusChange,
        onStatusChange: setStatus,
        onBlockError: onBlockError,
        onError: onError,
      });
    });
    return () => {
      if (!buildel.current) return;
      buildel.current.disconnect();
    };
  }, []);

  return {
    status,
    startRun,
    joinRun,
    stopRun,
    push,
    id: run.current?.runId,
  };
}
