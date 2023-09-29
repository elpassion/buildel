import { useEffect, useRef, useState } from "react";
import { assert } from "ts-utils";
import { BuildelRun, BuildelRunStatus, BuildelSocket } from "buildel";

export function usePipelineRun(
  organizationId: number,
  pipelineId: number,
  onBlockOutput: (
    blockId: string,
    outputName: string,
    payload: unknown
  ) => void = () => {},
  onBlockStatusChange: (blockId: string, isWorking: boolean) => void = () => {}
) {
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRun>();

  const [status, setStatus] = useState<BuildelRunStatus>("idle");

  const startRun = async () => {
    assert(run.current);
    await run.current.start();
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
    buildel.current = new BuildelSocket(organizationId, {
      socketUrl: "/super-api/socket",
    });
    buildel.current.connect().then((buildel) => {
      run.current = buildel.run(pipelineId, {
        onBlockOutput,
        onBlockStatusChange,
        onStatusChange: setStatus,
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
    stopRun,
    push,
  };
}
