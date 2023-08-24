'use client';
import React, { PropsWithChildren, useContext, useMemo, useState } from 'react';
import { usePipelineRun } from '~/modules/Pipelines';

interface IEvent {
  block: string;
  output: string;
  payload: {
    message: string;
  };
}
interface IRunPipelineContext {
  events: IEvent[];
  startRun: () => void;
  stopRun: () => void;
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

  const { status, startRun, stopRun, push, io } = usePipelineRun(
    pipelineId,
    (block, output, payload) =>
      setEvents((events) => [...events, { block, output, payload }]),
  );

  // @ts-ignore
  window.push = push;

  const value = useMemo(
    () => ({ events, status, startRun, stopRun }),
    [events, startRun, status, stopRun],
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
    }),
    [blockName, ctx.events],
  );
};
