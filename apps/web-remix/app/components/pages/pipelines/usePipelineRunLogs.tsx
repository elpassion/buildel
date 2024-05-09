import { useEffect, useRef, useState } from "react";
import { assert } from "~/utils/assert";
import {
  BuildelRunLogs,
  BuildelRunLogsConnectionStatus,
  BuildelSocket,
  BuildelRunLogsJoinArgs,
  ConnectionState,
} from "/home/pawel/work/code/buildel/apps/web-remix/node_modules/.pnpm/file+..+..+packages+buildel+dist/node_modules/dist/index";

export function usePipelineRunLogs(
  organizationId: number,
  pipelineId: number,
  runId: number,
  onMessage: (
    payload: unknown
  ) => void = () => { },
  useAuth: boolean = true
) {
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRunLogs>();

  const [status, setStatus] = useState<ConnectionState>("closed");

  const listenToLogs = async (args: BuildelRunLogsJoinArgs) => {
    assert(run.current);
    console.log('przeszlo')
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
    console.log("CURRENT")
    buildel.current.connect().then((buildel) => {
      run.current = buildel.logs(pipelineId, runId, {
        onMessage: onMessage,
        onStatusChange: () => { },
      });
      console.log('foo')
    });
    console.log("DONE")

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
