import { useEffect, useRef, useState } from "react";
import { assert } from "~/utils/assert";
import {
  BuildelRunLogs,
  BuildelSocket,
  BuildelRunLogsJoinArgs,
  ConnectionState,
} from "@buildel/buildel";

export function usePipelineRunLogs(
  organizationId: number,
  pipelineId: number,
  runId: number,
  onMessage: (
    payload: any
  ) => void = () => { },
  onLogMessage: (
    payload: any
  ) => void = () => { },
  onError: (error: string) => void = () => { },
  useAuth: boolean = true
) {
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRunLogs>();

  const [status, setStatus] = useState<ConnectionState>("closed");

  const listenToLogs = async (args: BuildelRunLogsJoinArgs) => {
    assert(run.current);
    await run.current.join(args);
  };
  const stopListening = async () => {
    assert(run.current);
    await run.current.leave();
  };

  useEffect(() => {
    buildel.current = new BuildelSocket(organizationId, {
      socketUrl: "/super-api/socket",
      useAuth,
      onStatusChange: setStatus,
    });
    buildel.current.connect().then((buildel) => {
      run.current = buildel.logs(pipelineId, runId, {
        onMessage: onMessage,
        onLogMessage: onLogMessage,
        onStatusChange: () => { },
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
    listenToLogs,
    stopListening
  };
}
