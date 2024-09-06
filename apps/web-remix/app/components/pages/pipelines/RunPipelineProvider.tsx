import type { PropsWithChildren } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SafeParseReturnType, ZodError } from 'zod';

import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import { errorToast } from '~/components/toasts/errorToast';

import type { IBlockConfig, IExtendedPipeline } from './pipeline.types';
import { usePipelineRun } from './usePipelineRun';

export type Metadata = Record<string, any>;

export interface IEvent {
  block: string;
  output: string;
  payload: any;
}
interface IRunPipelineContext {
  events: IEvent[];
  blockStatuses: Record<string, boolean>;
  blockValidations: Record<
    string,
    { success: true } | { success: false; error: ZodError }
  >;
  errors: Record<string, string[]>;
  startRun: () => void;
  stopRun: () => void;
  push: (topic: string, payload: any) => void;
  clearEvents: (blockName: string) => void;
  clearBlockEvents: (blockName: string) => void;
  runId: string | null | undefined;
  status: 'idle' | 'starting' | 'running';
  joinRun: (runId: number) => void;
  isValid: boolean;
  organizationId: number;
  pipelineId: number;
  metadata: Metadata;
  setMetadata: (value: Metadata) => void;
}

const RunPipelineContext = React.createContext<IRunPipelineContext | undefined>(
  undefined,
);
interface RunPipelineProviderProps extends PropsWithChildren {
  pipeline: IExtendedPipeline;
  alias: string;
}

export const RunPipelineProvider: React.FC<RunPipelineProviderProps> = ({
  children,
  pipeline,
  alias,
}) => {
  const [metadata, setMetadata] = useState<Metadata>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [blockStatuses, setBlockStatuses] = useState<Record<string, boolean>>(
    {},
  );

  const onMessage = useCallback(
    (block: string, output: string, payload: any) =>
      setEvents((events) => [...events, { block, output, payload }]),
    [],
  );

  const onBlockError = useCallback((blockId: string, errors: string[]) => {
    setErrors((prev) => {
      const blockErrors = prev[blockId] || [];

      return {
        ...prev,
        [blockId]: [...blockErrors, ...errors],
      };
    });

    errors.forEach((err) => {
      errorToast({
        title: 'Run failed!',
        description: `The workflow run failed due to an error (${err}) in block ${blockId}.`,
      });
    });
  }, []);

  const onError = useCallback((error: string) => {
    errorToast({
      title: 'Run failed!',
      description: `The workflow run failed due to an error: ${error}.`,
    });
  }, []);

  const onStatusChange = useCallback((block: string, status: boolean) => {
    setBlockStatuses((prev) => ({ ...prev, [block]: status }));
  }, []);

  const {
    status,
    startRun,
    stopRun,
    joinRun,
    push,
    id: runId,
  } = usePipelineRun(
    pipeline.organization_id,
    pipeline.id,
    onMessage,
    onStatusChange,
    onBlockError,
    onError,
  );

  const handleStartRun = useCallback(async () => {
    setErrors({});
    await startRun({ initial_inputs: [], alias, metadata });
  }, [startRun, alias]);

  const handleJoinRun = useCallback(
    async (runId: number) => {
      setErrors({});
      await joinRun({ initial_inputs: [], alias, metadata, runId });
    },
    [joinRun, alias],
  );

  const handlePush = useCallback(
    (topic: string, payload: any) => {
      push(topic, payload);
      setErrors({});
    },
    [push],
  );

  const clearEvents = useCallback((blockName: string) => {
    setEvents((prev) => prev.filter((ev) => ev.block === blockName));
  }, []);

  const clearBlockEvents = useCallback((blockName: string) => {
    setEvents((prev) => prev.filter((ev) => ev.block !== blockName));
  }, []);

  const blockValidations = useMemo(() => {
    if (!pipeline) return {};

    return pipeline.config.blocks.reduce(
      (acc, block) => {
        if (!block.block_type?.schema) return acc;
        return {
          ...acc,
          [block.name]: generateZODSchema(
            block.block_type.schema as any,
          ).safeParse({
            name: block.name,
            opts: block.opts,
            inputs: block.inputs,
          }),
        };
      },
      {} as Record<string, SafeParseReturnType<unknown, unknown>>,
    );
  }, [pipeline]);

  const isValid = useMemo(() => {
    return Object.values(blockValidations).every((v) => v.success);
  }, [blockValidations]);

  useEffect(() => {
    if (status === 'idle') {
      setBlockStatuses({});
    }
  }, [status]);

  const value = useMemo(
    () => ({
      events,
      status,
      startRun: handleStartRun,
      push: handlePush,
      stopRun,
      clearEvents,
      clearBlockEvents,
      runId,
      blockStatuses,
      blockValidations,
      isValid,
      organizationId: pipeline.organization_id,
      pipelineId: pipeline.id,
      joinRun: handleJoinRun,
      errors,
      metadata,
      setMetadata,
    }),
    [
      errors,
      events,
      handlePush,
      handleStartRun,
      handleJoinRun,
      status,
      stopRun,
      clearEvents,
      clearBlockEvents,
      blockStatuses,
      blockValidations,
      isValid,
      metadata,
      setMetadata,
    ],
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

export const useRunPipelineEdge = () => {
  const ctx = useContext(RunPipelineContext);

  if (!ctx) {
    throw new Error('useRunPipeline must be used within RunPipelineProvider');
  }

  const value = useMemo(() => {
    return { status: ctx.status };
  }, [ctx.status]);

  return value;
};

export const useRunPipelineNode = (block: IBlockConfig) => {
  const blockName = block.name;
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

  const isValid = useMemo(() => {
    return !ctx.errors[blockName] && ctx.blockValidations[blockName]?.success;
  }, [blockName, ctx.blockValidations, ctx.errors]);

  const errors = useMemo(() => {
    const validation = ctx.blockValidations[blockName] || { success: true };
    if (validation?.success) {
      return [];
    } else {
      return validation.error.errors.map((err) => err.message);
    }
  }, [blockName, ctx.blockValidations]);

  return useMemo(
    () => ({
      status,
      isValid,
      events: filteredEvents,
      push: ctx.push,
      clearEvents: ctx.clearEvents,
      clearBlockEvents: ctx.clearBlockEvents,
      errors,
    }),
    [
      status,
      isValid,
      filteredEvents,
      ctx.push,
      ctx.clearEvents,
      ctx.clearBlockEvents,
      ctx.blockValidations,
      blockName,
    ],
  );
};
