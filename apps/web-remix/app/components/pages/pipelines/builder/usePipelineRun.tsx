import { useEffect, useRef, useState } from "react";
import { assert } from "~/utils/assert";
import { BuildelRun, BuildelSocket } from "~/utils/buildel";

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
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRun>();

  const [status, setStatus] = useState<"idle" | "starting" | "running">("idle");

  const startRun = async () => {
    assert(run.current);
    await run.current.start();
    setStatus(run.current.status);
  };
  const stopRun = async () => {
    assert(run.current);
    await run.current.stop();
    setStatus(run.current.status);
  };
  const push = (topic: string, payload: any) => {
    assert(run.current);
    run.current.push(topic, payload);
  };

  useEffect(() => {
    buildel.current = new BuildelSocket(organizationId);
    buildel.current.connect().then((buildel) => {
      run.current = buildel.run(pipelineId, { onOutput, onStatusChange });
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
