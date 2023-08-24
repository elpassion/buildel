'use client';
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { usePipelineRun } from '~/modules/Pipelines';

export interface IEvent {
  block: string;
  output: string;
  payload: {
    //Fix it - other response types
    message: any;
  };
}
interface IRunPipelineContext {
  events: IEvent[];
  blockStatuses: Record<string, boolean>;
  startRun: () => void;
  stopRun: () => void;
  push: (topic: string, payload: any) => void;
  clearEvents: (blockName: string) => void;
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
  const [blockStatuses, setBlockStatuses] = useState<Record<string, boolean>>(
    {},
  );

  const onMessage = useCallback(
    (block: string, output: string, payload: any) =>
      setEvents((events) => [...events, { block, output, payload }]),
    [],
  );

  const onStatusChange = useCallback((block: string, status: boolean) => {
    setBlockStatuses((prev) => ({ ...prev, [block]: status }));
  }, []);

  const { status, startRun, stopRun, push } = usePipelineRun(
    pipelineId,
    onMessage,
    onStatusChange,
  );

  const clearEvents = useCallback((blockName: string) => {
    setEvents((prev) => prev.filter((ev) => ev.block === blockName));
  }, []);

  // @ts-ignore
  window.push = push;

  const value = useMemo(
    () => ({
      events,
      status,
      startRun,
      stopRun,
      push,
      clearEvents,
      blockStatuses,
    }),
    [events, push, startRun, status, stopRun, clearEvents, blockStatuses],
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

  const filteredEvents = useMemo(
    () => ctx.events.filter((ev) => ev.block === blockName),
    [blockName, ctx.events],
  );

  const status = useMemo(
    () => ctx.blockStatuses[blockName] ?? false,
    [blockName, ctx.blockStatuses],
  );

  return useMemo(
    () => ({
      status,
      events: filteredEvents,
      push: ctx.push,
      clearEvents: ctx.clearEvents,
    }),
    [filteredEvents, ctx.push, ctx.clearEvents, status],
  );
};
