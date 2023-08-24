'use client';
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { usePipelineRun } from '~/modules/Pipelines';

interface IEvent {
  block: string;
  output: string;
  payload: {
    //Fix it - other response types
    message: string;
  };
}
interface IRunPipelineContext {
  events: IEvent[];
  startRun: () => void;
  stopRun: () => void;
  push: (topic: string, payload: any) => void;
  status: 'idle' | 'starting' | 'running';
}

const RunPipelineContext = React.createContext<IRunPipelineContext | undefined>(
  undefined,
);
interface RunPipelineProviderProps extends PropsWithChildren {
  pipelineId: string;
}

export const RunPipelineProvider: React.FC<RunPipelineProviderProps> = ({
  children,
  pipelineId,
}) => {
  const [events, setEvents] = useState<any[]>([]);

  const onMessage = useCallback(
    (block: string, output: string, payload: any) =>
      setEvents((events) => [...events, { block, output, payload }]),
    [],
  );

  const { status, startRun, stopRun, push, io } = usePipelineRun(
    pipelineId,
    onMessage,
  );

  // @ts-ignore
  window.push = push;

  const value = useMemo(
    () => ({ events, status, startRun, stopRun, push }),
    [events, push, startRun, status, stopRun],
  );
  return (
    <RunPipelineContext.Provider value={value}>
      {children}
    </RunPipelineContext.Provider>
  );
};

export const useRunPipeline = () => {
  const ctx = useContext(RunPipelineContext);

  if (!ctx) {
    throw new Error('useRunPipeline must be used within RunPipelineProvider');
  }

  return ctx;
};

export const useRunPipelineNode = (blockName: string) => {
  const ctx = useContext(RunPipelineContext);

  if (!ctx) {
    throw new Error(
      'useRunPipelineNode must be used within RunPipelineProvider',
    );
  }

  return useMemo(
    () => ({
      events: ctx.events.filter((ev) => ev.block === blockName),
      push: ctx.push,
    }),
    [blockName, ctx.events, ctx.push],
  );
};
