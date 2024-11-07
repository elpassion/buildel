import { useEffect, useRef, useState } from 'react';
import { BuildelSocket } from '@buildel/buildel';
import type {
  BuildelRun,
  BuildelRunHandlers,
  BuildelRunJoinArgs,
  BuildelRunStartArgs,
  BuildelRunStatus,
  BuildelSocketOptions,
} from '@buildel/buildel';

import { assert } from '~/utils/assert';

export type UsePipelineRunSocketArgs = BuildelSocketOptions;

export type UsePipelineRunArgs = Partial<BuildelRunHandlers> & {
  organizationId: number;
  pipelineId: number;
  socketArgs?: UsePipelineRunSocketArgs;
};

export function usePipelineRun({
  organizationId,
  pipelineId,
  socketArgs = { useAuth: true },
  ...rest
}: UsePipelineRunArgs) {
  const buildel = useRef<BuildelSocket>(null);
  const run = useRef<BuildelRun>(null);

  const [status, setStatus] = useState<BuildelRunStatus>('idle');

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
  const loadHistory = () => {
    assert(run.current);
    return run.current.loadHistory();
  };

  useEffect(() => {
    buildel.current = new BuildelSocket(organizationId, {
      socketUrl: '/super-api/socket',
      ...socketArgs,
    });
    buildel.current.connect().then((buildel) => {
      run.current = buildel.run(pipelineId, {
        onStatusChange: setStatus,
        ...rest,
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
    loadHistory,
    id: run.current?.runId,
  };
}
